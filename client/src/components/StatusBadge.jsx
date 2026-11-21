import { ETIQUETAS } from '../lib/constants';

export default function StatusBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{ETIQUETAS[estado] || estado}</span>;
}
