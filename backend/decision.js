"use strict";

const { Contract } = require("fabric-contract-api");

class DecisionContract extends Contract {
  async evaluateApplicant(
    ctx,
    did,
    income,
    dependents,
    hasAssets,
    kycVerified,
  ) {
    //  DID Validation
    if (!did.startsWith("did:welfare:")) {
      throw new Error("Invalid DID format");
    }

    // KYC Validation
    if (kycVerified !== "true") {
      throw new Error("KYC not verified");
    }

    let score = 0;
    let reasons = [];

    // Scoring Logic

    if (parseInt(income) < 50000) {
      score += 30;
      reasons.push("Low income");
    }

    if (hasAssets === "false") {
      score += 20;
      reasons.push("No assets");
    }

    if (parseInt(dependents) >= 3) {
      score += 20;
      reasons.push("High number of dependents");
    }

    // Additional Factors

    let electricityUsage = 100;
    let previousWelfare = false;

    if (electricityUsage < 120) {
      score += 10;
      reasons.push("Low electricity usage");
    }

    if (!previousWelfare) {
      score += 10;
      reasons.push("No previous welfare support");
    }

    //  Classification

    let category = "Transitional";

    if (score >= 80) {
      category = "Severely Poor";
    } else if (score >= 60) {
      category = "Poor";
    } else if (score >= 40) {
      category = "Vulnerable";
    }

    //  Decision

    let result = score >= 60 ? "Eligible" : "Not Eligible";

    //  Explanation

    let explanation = reasons.join(", ");

    //  Create Applicant Object

    const applicantData = {
      did,
      score,
      category,
      result,
      reason: explanation,
    };

    // Store using DID

    await ctx.stub.putState(did, Buffer.from(JSON.stringify(applicantData)));

    // Return Result

    return JSON.stringify(applicantData);
  }

  // Retrieve Applicant Data using DID

  async getApplicant(ctx, did) {
    const data = await ctx.stub.getState(did);

    if (!data || data.length === 0) {
      throw new Error("Applicant not found");
    }

    return data.toString();
  }
}

module.exports = DecisionContract;
