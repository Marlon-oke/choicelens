export default function ChooseBoxes({
  nameA,
  nameB,
  notesA,
  notesB,
}: {
  nameA: string;
  nameB: string;
  notesA: string[];
  notesB: string[];
}) {
  return (
    <div className="choose-boxes">
      <div className="choose choose-a">
        <h3>✓ Choose {nameA} if...</h3>
        <ul>
          {notesA.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div className="choose choose-b">
        <h3>✓ Choose {nameB} if...</h3>
        <ul>
          {notesB.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
