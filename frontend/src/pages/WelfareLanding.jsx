import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WelfareLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />
      
      <div className="content-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Top Header / Language / Help Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            ← Back to Services/ආපසු
          </button>
          
          <div style={{ display: 'flex', background: 'white', border: '1px solid #cbd5e1', borderRadius: '24px', padding: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', margin: '0 12px' }}>Language / භාෂාව:</span>
            <div style={{ background: '#0d9488', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600' }}>English | සිංහල</div>
            <div style={{ color: '#64748b', padding: '4px 12px', fontSize: '13px', cursor: 'pointer' }}>English</div>
            <div style={{ color: '#64748b', padding: '4px 12px', fontSize: '13px', cursor: 'pointer' }}>සිංහල</div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔊 Listen / අහන්න
            </button>
            <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ❓ Need Help? / උදව් අවශ්‍යද?
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #a7f3d0', marginBottom: '20px' }}>
            <i className="fa-solid fa-shield-check"></i> Before You Apply • අයදුම් කිරීමට පෙර
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
            Apply for Aswesuma / අස්වැසුම සඳහා අයදුම් කරන්න
          </h1>
          
          <p style={{ fontSize: '15px', color: '#475569', marginBottom: '4px' }}>
            We will guide you step by step to complete your application. Please have the following 5 items ready before you begin:
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            ඔබගේ අයදුම්පත සම්පූර්ණ කිරීමට අපි පියවරෙන් පියවර මඟ පෙන්වන්නෙමු. ආරම්භ කිරීමට පෙර කරුණාකර පහත කරුණු 5 සූදානම් කර තබා ගන්න:
          </p>

          {/* 5 Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            
            {/* Item 1 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-id-card" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>1. National Identity Cards (NIC)</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d9488', marginBottom: '8px' }}>1. ජාතික හැඳුනුම්පත් තොරතුරු</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>NIC numbers of yourself and your family members.</div>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-users" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>2. Household Information</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d9488', marginBottom: '8px' }}>2. පවුලේ සාමාජිකයන්</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Number of family members living together and school attendance of children.</div>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-sack-dollar" style={{ color: '#d97706', fontSize: '16px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>3. Income and Expenses</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d9488', marginBottom: '8px' }}>3. ආදායම සහ වියදම්</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Monthly household earnings, regular expenses, and electricity bill units.</div>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-house" style={{ color: '#ef4444', fontSize: '16px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>4. Housing & Assets Information</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d9488', marginBottom: '8px' }}>4. නිවාස සහ දේපළ තොරතුරු</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Details about your house (roof, walls, floor), land, vehicles, and appliances.</div>
                </div>
              </div>
            </div>

            {/* Item 5 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-building-columns" style={{ color: '#8b5cf6', fontSize: '16px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>5. Bank Details</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d9488', marginBottom: '8px' }}>5. බැංකු ගිණුම් විස්තර</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Active bank account number and branch matching your NIC name.</div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Warning Box */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d97706', fontSize: '20px', marginTop: '2px' }}></i>
            <div>
              <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                Please Note: Please provide accurate information about your household. Do not guess or intentionally provide incorrect information.
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>
                විශේෂ දැනුම්දීම: කරුණාකර ඔබගේ පවුල පිළිබඳ නිවැරදි තොරතුරු ලබා දෙන්න. නොදන්නා තොරතුරු අනුමාන කර හෝ වැරදි තොරතුරු හිතාමතා ලබා නොදෙන්න.
              </div>
            </div>
          </div>

          {/* Application Steps */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '24px' }}>
              Application Steps / අයදුම් කිරීමේ පියවර
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ background: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>1</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Your Information</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ඔබේ තොරතුරු</div>
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '16px' }}>→</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ background: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>2</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Household Information</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>පවුලේ තොරතුරු</div>
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '16px' }}>→</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ background: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>3</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Income & Living Conditions</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ආදායම සහ ජීවන තත්ත්වය</div>
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '16px' }}>→</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ background: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>4</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Review</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>සමාලෝචනය</div>
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '16px' }}>→</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ background: '#ecfdf5', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #059669', fontSize: '13px', fontWeight: '700', color: '#059669' }}>5</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>Submit</div>
                  <div style={{ fontSize: '11px', color: '#059669' }}>ඉදිරිපත් කරන්න</div>
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ background: '#f1f5f9', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
            >
              ← Back / ආපසු
            </button>
            <button 
              onClick={() => navigate('/welfare-apply')}
              style={{ background: '#0d9488', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Start Application / අයදුම් කිරීම ආරම්භ කරන්න →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
