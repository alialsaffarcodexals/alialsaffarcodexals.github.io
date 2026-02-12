/**
 * projectsTable.js
 * Projects table UI: filter controls, pagination, and row rendering.
 */
import { debounce } from '../../utils/debounce.js';

// initProjectsTable: Initializes project table filters, listeners, and first render.
export function initProjectsTable(allProjects) {
  const projType = document.getElementById('projType');
  const projResult = document.getElementById('projResult');
  const projSearch = document.getElementById('projSearch');
  const projectsBody = document.getElementById('projectsBody');
  const projCount = document.getElementById('projCount');
  const projLoadMore = document.getElementById('projLoadMore');

  if (!projectsBody) return;

  let projPageSize = 15;
  let projVisible = projPageSize;

  const normalizeType = (t) => String(t || '').toLowerCase();

  // matchesType: Checks whether a project row matches the selected type filter.
  function matchesType(p, selected) {
    if (!selected) return true;
    const t = normalizeType(p.type);
    // Be flexible because backend type text may vary.
    if (selected === 'exam') return t.includes('exam');
    if (selected === 'project') return t.includes('project');
    if (selected === 'exercise') return t.includes('exercise');
    return true;
  }

  // matchesResult: Checks whether a project row matches the selected result filter.
  function matchesResult(p, selected) {
    if (!selected) return true;
    const r = String(p.result || '').toLowerCase();
    if (selected === 'passed') return r === 'pass' || r === 'passed';
    if (selected === 'failed') return r === 'fail' || r === 'failed';
    return true;
  }

  // filterProjects: Applies search, type, and result filters to project rows.
  function filterProjects() {
    const q = (projSearch?.value || '').toLowerCase();
    const selectedType = (projType?.value || '').toLowerCase();
    const selectedResult = (projResult?.value || '').toLowerCase();

    return allProjects.filter((p) => {
      const hay = `${p.name} ${p.type}`.toLowerCase();
      const textOk = !q || hay.includes(q);
      const typeOk = matchesType(p, selectedType);
      const resultOk = matchesResult(p, selectedResult);
      return textOk && typeOk && resultOk;
    });
  }

  // renderProjects: Renders the current page of projects and toggles load-more visibility.
  function renderProjects() {
    const filtered = filterProjects();
    const visible = filtered.slice(0, projVisible);

    projectsBody.innerHTML =
      visible.length
        ? visible
            .map(
              (p) => `
          <tr>
            <td>${p.name}</td>
            <td>${p.type}</td>
            <td>${p.objectId}</td>
            <td>${p.result}</td>
            <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
          </tr>
        `
            )
            .join('')
        : '<tr><td colspan="5" class="muted">No projects found</td></tr>';

    if (projCount) projCount.textContent = `${Math.min(projVisible, filtered.length)} of ${filtered.length}`;
    if (projLoadMore) projLoadMore.style.display = filtered.length > projVisible ? 'inline-flex' : 'none';
  }

  // resetAndRender: Resets pagination and re-renders using current filters.
  const resetAndRender = () => {
    projVisible = projPageSize;
    renderProjects();
  };

  projSearch?.addEventListener('input', debounce(resetAndRender, 200));
  projType?.addEventListener('change', resetAndRender);
  projResult?.addEventListener('change', resetAndRender);


  projLoadMore?.addEventListener('click', () => {
    projVisible += projPageSize;
    renderProjects();
  });

  renderProjects();
}
