export const loanProducts = {
  // Samupakara (Cooperative Rural Bank / Sanasa)
  below_25000: {
    id: "below_25000",
    bank: "Samupakara (Cooperative Rural Bank)",
    title: "Below Rs. 25,000 Micro-Loan",
    subtitle: "Quick emergency micro-credit with minimal documentation",
    min: 5000,
    max: 25000,
    defaultAmount: 20000,
    interestRate: 8,
    maxMonths: 24,
    defaultMonths: 12,
    icon: "fa-hand-holding-dollar",
    badge: "8% Low Interest",
    features: [
      "No collateral required",
      "Approval within 24 hours",
      "Repayment up to 24 months"
    ]
  },
  above_25000: {
    id: "above_25000",
    bank: "Samupakara (Cooperative Rural Bank)",
    title: "Above Rs. 25,000 Development Loan",
    subtitle: "Affordable capital financing for local micro-enterprises",
    min: 25000,
    max: 150000,
    defaultAmount: 75000,
    interestRate: 8,
    maxMonths: 36,
    defaultMonths: 24,
    icon: "fa-seedling",
    badge: "8% Low Interest",
    features: [
      "Community peer guarantor support",
      "Flexible monthly installments",
      "Up to 36 months repayment"
    ]
  },
  long_term: {
    id: "long_term",
    bank: "Samupakara (Cooperative Rural Bank)",
    title: "Long Term Investment Loan",
    subtitle: "Extended term capital financing for equipment & asset building",
    min: 50000,
    max: 500000,
    defaultAmount: 200000,
    interestRate: 20,
    maxMonths: 60,
    defaultMonths: 48,
    icon: "fa-chart-line",
    badge: "Long Term",
    features: [
      "High loan limits up to Rs. 500,000",
      "Extended terms up to 5 years",
      "Grace period available"
    ]
  },
  epf_loan: {
    id: "epf_loan",
    bank: "Samupakara (Cooperative Rural Bank)",
    title: "EPF Backed Secured Loan",
    subtitle: "Low rate credit secured against your employee provident fund",
    min: 50000,
    max: 400000,
    defaultAmount: 150000,
    interestRate: 13,
    maxMonths: 48,
    defaultMonths: 36,
    icon: "fa-shield-halved",
    badge: "13% APR",
    features: [
      "Secured against EPF balance",
      "Fast-track processing",
      "Competitive 13% fixed rate"
    ]
  },

  // Samurdhi Banking Society (සමෘද්ධි)
  lakjaya: {
    id: "lakjaya",
    bank: "Samurdhi Banking Society",
    title: "Lak Jaya Microloan (ලක් ජය)",
    subtitle: "Livelihood & cottage industry micro-capital",
    min: 10000,
    max: 100000,
    defaultAmount: 50000,
    interestRate: 15,
    maxMonths: 36,
    defaultMonths: 24,
    icon: "fa-briefcase",
    badge: "Samurdhi Certified",
    features: [
      "Designed for low-income entrepreneurs",
      "Group guarantee acceptance",
      "No hidden processing fees"
    ]
  },
  lak_wasana: {
    id: "lak_wasana",
    bank: "Samurdhi Banking Society",
    title: "Lak Wasana Business Loan (ලක් වාසනා)",
    subtitle: "Enterprise expansion capital for established micro-businesses",
    min: 100000,
    max: 1000000,
    defaultAmount: 300000,
    interestRate: 16,
    maxMonths: 60,
    defaultMonths: 48,
    icon: "fa-building-columns",
    badge: "High Limit",
    features: [
      "Loans up to Rs. 1,000,000",
      "Custom business repayment schedules",
      "Dedicated field officer guidance"
    ]
  },
  liya_sawiya: {
    id: "liya_sawiya",
    bank: "Samurdhi Banking Society",
    title: "Liya Sawiya Women Loan (ලිය සවිය)",
    subtitle: "Special subsidized micro-finance empowering female entrepreneurs",
    min: 50000,
    max: 500000,
    defaultAmount: 150000,
    interestRate: 12,
    maxMonths: 48,
    defaultMonths: 36,
    icon: "fa-person-dress",
    badge: "12% Subsidized",
    features: [
      "Preferential 12% subsidized rate",
      "Free entrepreneurship training",
      "Flexible self-help group approval"
    ]
  },
  jiwanopaya: {
    id: "jiwanopaya",
    bank: "Samurdhi Banking Society",
    title: "Jiwanopaya Livelihood Loan (ජීවනෝපාය)",
    subtitle: "Farming, poultry, and home-based craft enhancement loan",
    min: 50000,
    max: 1000000,
    defaultAmount: 200000,
    interestRate: 14,
    maxMonths: 60,
    defaultMonths: 48,
    icon: "fa-tractor",
    badge: "Livelihood Aid",
    features: [
      "Harvest-aligned seasonal repayments",
      "Equipment & livestock financing",
      "Low documentation threshold"
    ]
  },
  chakrya: {
    id: "chakrya",
    bank: "Samurdhi Banking Society",
    title: "Chakrya Revolving Loan (චක්‍රීය ණය)",
    subtitle: "Rotating community credit fund with ultra-low interest",
    min: 10000,
    max: 1000000,
    defaultAmount: 100000,
    interestRate: 10,
    maxMonths: 48,
    defaultMonths: 24,
    icon: "fa-arrows-rotate",
    badge: "10% Revolving",
    features: [
      "10% ultra-low revolving rate",
      "Immediate top-up on timely repayments",
      "Community self-help group backed"
    ]
  }
};