export default function ConnectorLine({ text }) {
  return (
    <div className="connector" role="presentation">
      <div className="connector-line" />
      {text && <span className="connector-text">{text}</span>}
      <div className="connector-line" />
    </div>
  );
}
