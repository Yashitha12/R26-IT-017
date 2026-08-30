const { createLoan } = require("./fabricService");

async function main() {

    try {

        const result = await createLoan(
            "LOAN003",
            "500000",
            "PERSONAL",
            "2"
        );

        console.log("\nFINAL RESULT:");
        console.log(result);

    } catch (error) {

        console.error("\nFABRIC ERROR:");
        console.error(error);

        process.exit(1);
    }
}

main();