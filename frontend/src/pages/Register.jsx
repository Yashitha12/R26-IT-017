import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Bio Data, 2: Biometric KYC, 3: Success

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    dob: "",
    gender: "Male",
    phone: "+94",
    email: "",
    address: "",
    district: "",
    gnDivision: "",
    occupation: "",
    username: "",
    password: "",
  });

  const [userId, setUserId] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Webcam & Document States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [docImage, setDocImage] = useState(null);

  // Start webcam when entering step 2
  useEffect(() => {
    if (step === 2 && !faceImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.warn("Webcam access unavailable, fallback to file upload:", err);
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setFaceImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setFaceImage(null);
    startCamera();
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Profile Registration & Start Identity Application
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Submit citizen registration to Smart Contract Backend (Port 5001)
      const regRes = await fetch("http://127.0.0.1:5001/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          nic: formData.nic,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          gnDivision: formData.gnDivision,
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || "Citizen profile registration failed");

      const newUserId = regData.data?.userId || `user-${Date.now().toString().slice(-4)}`;
      setUserId(newUserId);

      // 2. Initiate Identity Application
      const idRes = await fetch("http://127.0.0.1:5001/api/identity/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newUserId,
          gnDivision: formData.gnDivision,
        }),
      });

      const idData = await idRes.json();
      if (!idRes.ok) throw new Error(idData.error || "Identity application initialization failed");

      const newVerId = idData.data?.verificationId || `ver-${Date.now().toString().slice(-4)}`;
      setVerificationId(newVerId);

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Biometric KYC Evidence
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!faceImage || !docImage) {
      setError("Please provide both a face photo and a national identity document photo.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Submit Face Evidence
      const faceRes = await fetch(`http://127.0.0.1:5001/api/verification/${verificationId}/face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceImageBase64: faceImage,
          matchScore: 0.965,
        }),
      });
      if (!faceRes.ok) {
        const faceErr = await faceRes.json();
        throw new Error(faceErr.error || "Failed to submit biometric face evidence");
      }

      // 2. Submit Document Evidence
      const docRes = await fetch(`http://127.0.0.1:5001/api/verification/${verificationId}/document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "NATIONAL_IDENTITY_CARD",
          documentImageBase64: docImage,
          documentNumberMasked: formData.nic,
        }),
      });
      if (!docRes.ok) {
        const docErr = await docRes.json();
        throw new Error(docErr.error || "Failed to submit document evidence");
      }

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "40px 20px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", width: "100%", maxWidth: "680px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ backgroundColor: "#2563eb", color: "white", width: "60px", height: "60px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "26px" }}>
            <i className={step === 1 ? "fa-solid fa-user-plus" : step === 2 ? "fa-solid fa-id-card-clip" : "fa-solid fa-check"}></i>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>
            {step === 1 ? "Citizen Registration & Digital Identity" : step === 2 ? "Biometric Face ID & Document KYC" : "KYC Application Submitted!"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>
            {step === 1 ? "Step 1 of 2: Create your verified profile" : step === 2 ? "Step 2 of 2: Live webcam selfie & NIC document capture" : "Your Decentralized Identity (DID) application is under review"}
          </p>

          {/* Progress Bar */}
          <div style={{ display: "flex", gap: "8px", marginTop: "18px", justifyContent: "center" }}>
            <div style={{ height: "4px", width: "80px", borderRadius: "2px", backgroundColor: "#2563eb" }}></div>
            <div style={{ height: "4px", width: "80px", borderRadius: "2px", backgroundColor: step >= 2 ? "#2563eb" : "#e5e7eb" }}></div>
            <div style={{ height: "4px", width: "80px", borderRadius: "2px", backgroundColor: step === 3 ? "#10b981" : "#e5e7eb" }}></div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* STEP 1: BIO DATA FORM */}
        {step === 1 && (
          <form onSubmit={handleBioSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Aravinda Kumara" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>National Identity Card (NIC) *</label>
              <input type="text" name="nic" value={formData.nic} onChange={handleChange} required pattern="^([0-9]{9}[vVxX]|[0-9]{12})$" title="12 digits or 9 digits followed by v" placeholder="e.g. 200223003053" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Mobile Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="^\+94\d{9}$" maxLength={12} title="+94 followed by 9 digits" placeholder="+94781453248" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required pattern=".*@gmail\.com$" title="Must be a @gmail.com address" placeholder="e.g. citizen@gmail.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>District *</label>
              <select name="district" value={formData.district} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>Select District</option>
                <option value="Ampara">Ampara</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Badulla">Badulla</option>
                <option value="Batticaloa">Batticaloa</option>
                <option value="Colombo">Colombo</option>
                <option value="Galle">Galle</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Hambantota">Hambantota</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kandy">Kandy</option>
                <option value="Kegalle">Kegalle</option>
                <option value="Kilinochchi">Kilinochchi</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Mannar">Mannar</option>
                <option value="Matale">Matale</option>
                <option value="Matara">Matara</option>
                <option value="Moneragala">Moneragala</option>
                <option value="Mullaitivu">Mullaitivu</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Polonnaruwa">Polonnaruwa</option>
                <option value="Puttalam">Puttalam</option>
                <option value="Ratnapura">Ratnapura</option>
                <option value="Trincomalee">Trincomalee</option>
                <option value="Vavuniya">Vavuniya</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Grama Niladhari (GN) Division *</label>
              <input type="text" name="gnDivision" value={formData.gnDivision} onChange={handleChange} required placeholder="e.g. Minuwangoda North" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Permanent Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="e.g. 45/A, Jayawickrama Road" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", marginTop: "12px", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#1f2937", marginBottom: "12px" }}>Account Login Credentials</h3>
            </div>

            <div>
              <label style={labelStyle}>Username *</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Username" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "15px",
                }}
              >
                {loading ? "Creating Profile..." : "Proceed to Biometric Face & Document KYC →"}
              </button>
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "12px", fontSize: "14px", color: "#4b5563" }}>
              Already registered? <Link to="/login" style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "none" }}>Login here</Link>
            </div>
          </form>
        )}

        {/* STEP 2: BIOMETRIC KYC CAPTURE */}
        {step === 2 && (
          <form onSubmit={handleKycSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "4px" }}>Registration Reference</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>User ID: <strong style={{ color: "#0f172a" }}>{userId}</strong></span>
                <span>Verification ID: <strong style={{ color: "#2563eb" }}>{verificationId}</strong></span>
              </div>
            </div>

            {/* 1. Live Webcam Selfie Capture */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                1. Biometric Facial Verification (Live Selfie)
              </label>

              <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "16px", textAlign: "center", background: "#f8fafc" }}>
                {!faceImage ? (
                  <div>
                    {streamActive ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "340px", borderRadius: "8px", transform: "scaleX(-1)" }}></video>
                        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                        <div style={{ marginTop: "12px" }}>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            style={{ backgroundColor: "#2563eb", color: "white", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                          >
                            <i className="fa-solid fa-camera" style={{ marginRight: "8px" }}></i> Capture Selfie
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>Webcam inactive. You can upload a portrait selfie photo directly:</p>
                        <input type="file" accept="image/*" onChange={handleFaceUpload} style={{ fontSize: "13px" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <img src={faceImage} alt="Captured Face" style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "50%", border: "4px solid #10b981", margin: "0 auto 12px" }} />
                    <div style={{ color: "#10b981", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>
                      <i className="fa-solid fa-check-circle"></i> Biometric Face Captured
                    </div>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      style={{ background: "none", border: "1px solid #cbd5e1", padding: "6px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", color: "#475569" }}
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. NIC Document Upload */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                2. National Identity Card (NIC) Document
              </label>

              <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "20px", textAlign: "center", background: "#f8fafc" }}>
                {!docImage ? (
                  <div>
                    <i className="fa-solid fa-file-arrow-up" style={{ fontSize: "32px", color: "#94a3b8", marginBottom: "10px" }}></i>
                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>Upload clear photo or scan of your National Identity Card (NIC)</p>
                    <input type="file" accept="image/*" onChange={handleDocUpload} style={{ fontSize: "13px" }} required />
                  </div>
                ) : (
                  <div>
                    <img src={docImage} alt="NIC Document" style={{ maxWidth: "260px", maxHeight: "150px", objectFit: "contain", borderRadius: "8px", border: "1px solid #cbd5e1", margin: "0 auto 12px" }} />
                    <div style={{ color: "#10b981", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>
                      <i className="fa-solid fa-check-circle"></i> NIC Document Attached
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocImage(null)}
                      style={{ background: "none", border: "1px solid #cbd5e1", padding: "6px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", color: "#475569" }}
                    >
                      Change Document
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, backgroundColor: "#f1f5f9", color: "#475569", padding: "14px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !faceImage || !docImage}
                style={{
                  flex: 2,
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: loading || !faceImage || !docImage ? "not-allowed" : "pointer",
                  opacity: loading || !faceImage || !docImage ? 0.6 : 1,
                  fontSize: "15px",
                }}
              >
                {loading ? "Uploading Evidence..." : "Submit KYC Verification"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUBMISSION SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px" }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>Identity & KYC Successfully Submitted!</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "460px", margin: "0 auto 24px" }}>
              Your biometric face capture and national identity document have been submitted to the Divisional Secretariat. Once approved, your official Decentralized Identifier (DID) will be issued.
            </p>

            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", textAlign: "left", maxWidth: "400px", margin: "0 auto 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>User ID:</span>
                <strong style={{ color: "#0f172a" }}>{userId}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Verification ID:</span>
                <strong style={{ color: "#2563eb" }}>{verificationId}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Status:</span>
                <span style={{ backgroundColor: "#fef3c7", color: "#92400e", fontWeight: "bold", padding: "2px 8px", borderRadius: "10px", fontSize: "11px" }}>
                  AWAITING OFFICER REVIEW
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              style={{ width: "100%", maxWidth: "340px", backgroundColor: "#2563eb", color: "white", padding: "14px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Proceed to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#f9fafb",
  fontSize: "14px",
};
