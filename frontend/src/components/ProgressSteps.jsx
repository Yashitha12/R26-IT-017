export default function ProgressSteps({ step }) {
  return (
    <div className="steps">
      {[1, 2, 3, 4, 5].map((num) => (
        <div
          key={num}
          className={num <= step ? "step active" : "step"}
        >
          {num}
        </div>
      ))}
    </div>
  );
}