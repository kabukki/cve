import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import './index.css'

/**
 * API documentation:
 * https://cve.circl.lu/api/
 */

const partMap = {
  o: 'Operating System',
  h: 'Hardware',
  a: 'Application',
};

const getColor = (score) => {
  if (!Number.isFinite(score)) return '#ccc';
  else if (score < 2) return 'var(--primary-10)';
  else if (score < 4) return 'var(--primary-20)';
  else if (score < 6) return 'var(--primary-40)';
  else if (score < 8) return 'var(--primary-60)';
  else if (score < 10) return 'var(--primary-80)';
  else return 'var(--primary)';
};

const parseCPE = (cpe) => {
  const [,, part, vendor, product, version, update, edition, language] = cpe.split(':');

  return {
    part,
    vendor,
    product,
    version: update !== '*' ? `${version}  ${update}` : version,
    edition,
    language,
  };
};

const parseCPEs = (cpes) => {
  return cpes.reduce((acc, cpe) => {
    const { part, vendor, product, version } = parseCPE(cpe);

    acc[part] = (acc[part] || {});
    acc[part][vendor] = (acc[part][vendor] || {});
    acc[part][vendor][product] = (acc[part][vendor][product] || []).concat(version);

    return acc;
  }, {});
};

export const Home = () => {
  const [cves, setCves] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://cve.circl.lu/api/query', {
        headers: {
          limit: 20,
          skip: cves.length,
        },
      });
      const { results = [] } = await res.json();
      setCves((previous) => [...previous, ...results]);
    } catch (err) {
      console.error(err);      
    } finally {
      setLoading(false);
    }
  };

  useEffect(load, []);

  return (
    <div className="list">
      <input type="text" placeholder="Search a vulnerability..." />
      <ul className="results">
        {cves.map((cve) => (
          <li key={cve.id} className="item">
            <div className="severity" style={{ backgroundColor: getColor(cve.cvss), color: '#fff' }}>
              {cve.cvss?.toPrecision(2) || 'N/A'}
            </div>
            <div className="description">
              <div className="title">
                <Link className="id" to={`/cve/${cve.id}`}>{cve.id}</Link>
                <div className="detail">
                  by <b>{cve.assigner}</b> on <b>{new Date(cve.Modified).toLocaleString()}</b>
                </div>
              </div>
              <div className="summary">{cve.summary}</div>
              <div className="tags">
                {Object.entries(parseCPEs(cve.vulnerable_product)).map(([part, vendors]) => (
                  <div key={part} data-type={part} className="tag">
                    {partMap[part]} ({Object.keys(Object.values(vendors)).length})
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button className="load" onClick={load} disabled={loading}>
        {loading ? '...' : 'Load more'}
      </button>
    </div>
  )
};
