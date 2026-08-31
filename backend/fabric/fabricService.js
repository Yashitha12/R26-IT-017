const grpc = require("@grpc/grpc-js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
    connect,
    signers
} = require("@hyperledger/fabric-gateway");

// ---------------------------------------------------------
// FABRIC CONFIGURATION
// ---------------------------------------------------------

const FABRIC_DIR =
    "C:\\fabric_samples\\fabric-samples\\test-network";

const ORG1_DIR = path.join(
    FABRIC_DIR,
    "organizations",
    "peerOrganizations",
    "org1.example.com"
);

const CERT_DIR = path.join(
    ORG1_DIR,
    "users",
    "Admin@org1.example.com",
    "msp",
    "signcerts"
);

const KEY_DIR = path.join(
    ORG1_DIR,
    "users",
    "Admin@org1.example.com",
    "msp",
    "keystore"
);

const TLS_CERT = path.join(
    ORG1_DIR,
    "peers",
    "peer0.org1.example.com",
    "tls",
    "ca.crt"
);

// ---------------------------------------------------------
// NETWORK CONFIGURATION
// ---------------------------------------------------------

const PEER_ENDPOINT = "localhost:7051";
const PEER_HOST_ALIAS = "peer0.org1.example.com";

const MSP_ID = "Org1MSP";
const CHANNEL_NAME = "mychannel";
const CHAINCODE_NAME = "loancc";

// ---------------------------------------------------------
// FIND FIRST FILE
// ---------------------------------------------------------

function getFirstFile(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error(`Directory does not exist: ${directory}`);
    }

    const files = fs
        .readdirSync(directory)
        .filter((file) => !file.startsWith("."));

    if (files.length === 0) {
        throw new Error(`No files found in ${directory}`);
    }

    return path.join(directory, files[0]);
}

// ---------------------------------------------------------
// CONNECT TO HYPERLEDGER FABRIC
// ---------------------------------------------------------

async function connectToFabric() {

    console.log("Connecting to Hyperledger Fabric...");

    // Certificate
    const certificatePath = getFirstFile(CERT_DIR);

    // Private key
    const privateKeyPath = getFirstFile(KEY_DIR);

    // TLS CA certificate
    if (!fs.existsSync(TLS_CERT)) {
        throw new Error(
            `TLS certificate not found: ${TLS_CERT}`
        );
    }

    const certificate = fs.readFileSync(
        certificatePath
    );

    const privateKeyPem = fs.readFileSync(
        privateKeyPath
    );

    const tlsRootCert = fs.readFileSync(
        TLS_CERT
    );

    console.log("Certificate:", certificatePath);
    console.log("Private Key:", privateKeyPath);
    console.log("TLS CA:", TLS_CERT);

    // -----------------------------------------------------
    // GRPC CLIENT
    // -----------------------------------------------------

    const client = new grpc.Client(
        PEER_ENDPOINT,
        grpc.credentials.createSsl(tlsRootCert),
        {
            "grpc.ssl_target_name_override": PEER_HOST_ALIAS,
            "grpc.default_authority": PEER_HOST_ALIAS
        }
    );

    // -----------------------------------------------------
    // FABRIC IDENTITY
    // -----------------------------------------------------

    const id = {
        mspId: MSP_ID,
        credentials: certificate
    };

    // -----------------------------------------------------
    // SIGNER
    // -----------------------------------------------------

    const privateKey = crypto.createPrivateKey(
        privateKeyPem
    );

    const signer = signers.newPrivateKeySigner(
        privateKey
    );

    // -----------------------------------------------------
    // FABRIC GATEWAY CONNECTION
    // -----------------------------------------------------

    const gateway = connect({
        client,
        identity: id,
        signer: signer,

        evaluateOptions: () => ({
            deadline: Date.now() + 5000
        }),

        endorseOptions: () => ({
            deadline: Date.now() + 15000
        }),

        submitOptions: () => ({
            deadline: Date.now() + 15000
        }),

        commitStatusOptions: () => ({
            deadline: Date.now() + 60000
        })
    });

    console.log("Connected to Fabric Gateway.");

    // -----------------------------------------------------
    // NETWORK
    // -----------------------------------------------------

    const network = gateway.getNetwork(
        CHANNEL_NAME
    );

    // -----------------------------------------------------
    // SMART CONTRACT
    // -----------------------------------------------------

    const contract = network.getContract(
        CHAINCODE_NAME
    );

    console.log(
        `Connected to channel: ${CHANNEL_NAME}`
    );

    console.log(
        `Connected to chaincode: ${CHAINCODE_NAME}`
    );

    return {
        gateway,
        network,
        contract
    };
}

// ---------------------------------------------------------
// CREATE LOAN
// ---------------------------------------------------------

async function createLoan(
    loanId,
    nic,
    loanAmount,
    loanType,
    guarantorSupportCount
) {

    let gateway;

    try {

        const connection = await connectToFabric();

        gateway = connection.gateway;

        const contract = connection.contract;

        console.log("\nCreating loan on blockchain...");

        console.log("Loan ID:", loanId);
        console.log("NIC:", nic);
        console.log("Loan Amount:", loanAmount);
        console.log("Loan Type:", loanType);
        console.log(
            "Guarantor Support Count:",
            guarantorSupportCount
        );

        // -------------------------------------------------
        // SUBMIT TRANSACTION
        // -------------------------------------------------

        const result = await contract.submitTransaction(
            "CreateLoan",
            String(loanId),
            String(nic),
            String(loanAmount),
            String(loanType),
            String(guarantorSupportCount)
        );

        const resultString =
            Buffer.from(result).toString("utf8");

        console.log("\nBlockchain transaction successful.");

        console.log(
            "Blockchain response:",
            resultString
        );

        let parsedResult;

        try {
            parsedResult = JSON.parse(resultString);
        } catch {
            parsedResult = {
                rawResult: resultString
            };
        }

        return {
            success: true,
            transaction: parsedResult
        };

    } catch (error) {

        console.error(
            "\nFABRIC ERROR:"
        );

        console.error(error);

        throw error;

    } finally {

        if (gateway) {
            gateway.close();
        }
    }
}

// ---------------------------------------------------------
// GET LOAN
// ---------------------------------------------------------

async function getLoan(loanId) {

    let gateway;

    try {

        const connection = await connectToFabric();

        gateway = connection.gateway;

        const contract = connection.contract;

        console.log(
            `Querying loan: ${loanId}`
        );

        const result =
            await contract.evaluateTransaction(
                "GetLoan",
                String(loanId)
            );

        const resultString =
            Buffer.from(result).toString("utf8");

        let parsedResult;

        try {
            parsedResult = JSON.parse(resultString);
        } catch {
            parsedResult = {
                rawResult: resultString
            };
        }

        return {
            success: true,
            loan: parsedResult
        };

    } catch (error) {

        console.error(
            "\nFABRIC QUERY ERROR:"
        );

        console.error(error);

        throw error;

    } finally {

        if (gateway) {
            gateway.close();
        }
    }
}

// ---------------------------------------------------------
// GET ALL LOANS
// ---------------------------------------------------------

async function getAllLoans() {

    let gateway;

    try {

        const connection = await connectToFabric();

        gateway = connection.gateway;

        const contract = connection.contract;

        const result =
            await contract.evaluateTransaction(
                "GetAllLoans"
            );

        const resultString =
            Buffer.from(result).toString("utf8");

        let parsedResult;

        try {
            parsedResult = JSON.parse(resultString);
        } catch {
            parsedResult = {
                rawResult: resultString
            };
        }

        return {
            success: true,
            loans: parsedResult
        };

    } catch (error) {

        console.error(
            "\nFABRIC QUERY ERROR:"
        );

        console.error(error);

        throw error;

    } finally {

        if (gateway) {
            gateway.close();
        }
    }
}

// ---------------------------------------------------------
// EXPORT FUNCTIONS
// ---------------------------------------------------------

module.exports = {
    connectToFabric,
    createLoan,
    getLoan,
    getAllLoans
};