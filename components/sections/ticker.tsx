import { Lotus } from '../illustrations';

const names = ['Kashmir', 'Kerala', 'Bali', 'Ladakh', 'Maldives', 'Rajasthan', 'Bhutan', 'Santorini', 'Kyoto', 'Swiss Alps', 'Vietnam', 'Andaman'];

export function Ticker() {
  const row = names.flatMap((n) => [
    <span key={n} className="ticker__name">{n}</span>,
    <Lotus key={`${n}-l`} className="ticker__lotus" />,
  ]);
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__row">
        {row}
        {row.map((el, i) => <span key={`d${i}`} style={{ display: 'contents' }}>{el}</span>)}
      </div>
    </div>
  );
}
