import { useApp } from '../AppContext';
import { DemoBanner, Page } from '../components/Layout';
import { localize, PDFS } from '../lib/content';

export function PdfLibrary() {
  const { t, lang, navigate } = useApp();
  return (
    <Page title={t('pdfLibrary')}>
      {PDFS.some((p) => p.demo) && <DemoBanner />}
      <ul className="card-list">
        {PDFS.map((pdf) => (
          <li key={pdf.id}>
            <button type="button" className="card" onClick={() => navigate({ name: 'pdf', id: pdf.id })}>
              <span className="card-title">▤ {localize(pdf.title, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
    </Page>
  );
}
