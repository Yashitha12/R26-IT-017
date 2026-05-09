const DecisionContract = require("./decision");

async function test() {
  const contract = new DecisionContract();

  // Simulated blockchain storage
  let storage = {};

  const fakeCtx = {
    stub: {
      putState: async (key, value) => {
        storage[key] = value;
        console.log("Saved:", key, value.toString());
      },

      getState: async (key) => {
        return storage[key];
      },
    },
  };

  try {
    // DID Format
    const did = "did:welfare:user001";

    // Evaluate Applicant
    const result = await contract.evaluateApplicant(
      fakeCtx,
      did,
      "30000",
      "4",
      "false",
      "true",
    );

    console.log("Decision:", result);

    // Retrieve Applicant
    const retrieved = await contract.getApplicant(fakeCtx, did);

    console.log("Retrieved:", retrieved);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
