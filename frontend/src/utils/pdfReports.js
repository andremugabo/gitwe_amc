/**
 * Centralized PDF report generator for Gitwe AMC
 * Uses jsPDF + jspdf-autotable for professional reports
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND_BLUE = [30, 58, 138];       // #1e3a8a
const BRAND_GOLD = [217, 119, 6];       // #d97706
const LIGHT_GRAY = [248, 250, 252];     // #f8fafc
const BORDER_GRAY = [226, 232, 240];    // #e2e8f0
const TEXT_DARK = [15, 23, 42];         // #0f172a
const TEXT_MID = [100, 116, 139];       // #64748b

/**
 * Draws the branded header on the first page.
 */
function drawHeader(doc, title, subtitle = '') {
  const pageW = doc.internal.pageSize.getWidth();

  // Blue gradient bar
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, 38, 'F');

  // Gold accent stripe
  doc.setFillColor(...BRAND_GOLD);
  doc.rect(0, 38, pageW, 3, 'F');

  // Church cross symbol (text stand-in)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('✦ Gitwe AMC', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 213, 255);
  doc.text('Gitwe Adventist Ministerial Centre — Rwanda Union Mission', 14, 27);

  // Report title (right-aligned)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageW - 14, 18, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(186, 213, 255);
    doc.text(subtitle, pageW - 14, 27, { align: 'right' });
  }
}

/**
 * Draws a metadata info row below the header.
 */
function drawMeta(doc, metaItems = []) {
  const pageW = doc.internal.pageSize.getWidth();
  const y = 50;

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, 44, pageW, 16, 'F');
  doc.setDrawColor(...BORDER_GRAY);
  doc.line(0, 60, pageW, 60);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MID);

  const colW = pageW / metaItems.length;
  metaItems.forEach((item, i) => {
    const x = 14 + i * colW;
    doc.setFont('helvetica', 'bold');
    doc.text(item.label + ':', x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.value), x + doc.getTextWidth(item.label + ': '), y);
  });
}

/**
 * Draws a section heading inside the body.
 */
function drawSection(doc, text, y) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(14, y, 4, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text(text, 21, y + 6);
  return y + 14;
}

/**
 * Draws the page footer on every page.
 */
function addFooters(doc) {
  const pageCount = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setDrawColor(...BORDER_GRAY);
    doc.line(0, pageH - 14, pageW, pageH - 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MID);
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Gitwe Adventist Ministerial Centre`,
      14,
      pageH - 5
    );
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 5, { align: 'right' });
  }
}

/**
 * Common autoTable style config.
 */
const tableStyles = {
  headStyles: {
    fillColor: BRAND_BLUE,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    cellPadding: 4,
  },
  alternateRowStyles: {
    fillColor: LIGHT_GRAY,
  },
  bodyStyles: {
    fontSize: 8,
    cellPadding: 3.5,
    textColor: TEXT_DARK,
  },
  styles: {
    lineColor: BORDER_GRAY,
    lineWidth: 0.3,
  },
  margin: { left: 14, right: 14 },
};

// ─── REPORT GENERATORS ───────────────────────────────────────────────────────

/**
 * Generate a PDF of enrolled elders for Field Secretary.
 */
export function generateEldersReportPDF(elders, fieldName = 'Field') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  drawHeader(doc, 'Field Elders Report', fieldName);
  drawMeta(doc, [
    { label: 'Field', value: fieldName },
    { label: 'Total Elders', value: elders.length },
    { label: 'Date', value: today },
  ]);

  let y = drawSection(doc, 'Registered Church Elders', 68);

  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [['#', 'Full Name', 'Email Address', 'Phone', 'Local Church', 'Status']],
    body: elders.map((e, i) => [
      i + 1,
      e.name || '—',
      e.email || '—',
      e.phone || '—',
      e.localChurch?.name || '—',
      e.isActive ? 'Active' : 'Inactive',
    ]),
  });

  addFooters(doc);
  doc.save(`gitwe_amc_elders_report_${Date.now()}.pdf`);
}

/**
 * Generate a PDF of course enrollments / attendance for Field Secretary.
 */
export function generateEnrollmentReportPDF(courses, fieldName = 'Field') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  drawHeader(doc, 'Training Enrollment Report', fieldName);
  drawMeta(doc, [
    { label: 'Field', value: fieldName },
    { label: 'Total Courses', value: courses.length },
    { label: 'Date', value: today },
  ]);

  let y = 68;

  courses.forEach((course) => {
    y = drawSection(doc, course.title, y);
    const enrollments = course.enrollments || [];

    autoTable(doc, {
      ...tableStyles,
      startY: y,
      head: [['#', 'Elder Name', 'Email', 'Completion', 'Certified']],
      body: enrollments.length
        ? enrollments.map((en, i) => [
            i + 1,
            en.elder?.name || '—',
            en.elder?.email || '—',
            en.completionStatus || 'In Progress',
            en.isCertified ? 'Yes' : 'No',
          ])
        : [['—', 'No enrollments for this course', '', '', '']],
      didDrawPage: (d) => { y = d.cursor.y + 10; },
    });

    y = (doc.lastAutoTable?.finalY || y) + 12;
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
  });

  addFooters(doc);
  doc.save(`gitwe_amc_enrollment_report_${Date.now()}.pdf`);
}

/**
 * Generate a comprehensive Union Admin report PDF.
 */
export function generateUnionReportPDF({ users = [], courses = [], evaluations = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  drawHeader(doc, 'Union Administration Report', 'Rwanda Union Mission');
  drawMeta(doc, [
    { label: 'Total Leaders', value: users.length },
    { label: 'Total Courses', value: courses.length },
    { label: 'Date', value: today },
  ]);

  // Section 1: Leadership
  let y = drawSection(doc, 'Church Leadership Directory', 68);
  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [['#', 'Full Name', 'Email', 'Role', 'Phone', 'Status']],
    body: users.map((u, i) => [
      i + 1,
      u.name || '—',
      u.email || '—',
      u.role?.replace('_', ' ') || '—',
      u.phone || '—',
      u.isActive ? 'Active' : 'Suspended',
    ]),
  });

  // Section 2: Training Courses
  doc.addPage();
  drawHeader(doc, 'Union Administration Report', 'Rwanda Union Mission');
  y = drawSection(doc, 'Training Programs Overview', 48);
  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [['#', 'Course Title', 'Duration', 'Location', 'Start Date', 'Enrolled']],
    body: courses.map((c, i) => [
      i + 1,
      c.title || '—',
      c.duration || '—',
      c.location || '—',
      c.startDate ? new Date(c.startDate).toLocaleDateString() : '—',
      c._count?.enrollments ?? 0,
    ]),
  });

  // Section 3: Evaluations summary
  if (evaluations.length > 0) {
    doc.addPage();
    drawHeader(doc, 'Union Administration Report', 'Rwanda Union Mission');
    y = drawSection(doc, 'Training Evaluation Summary', 48);
    autoTable(doc, {
      ...tableStyles,
      startY: y,
      head: [['#', 'Elder', 'Course', 'Content', 'Teacher', 'Materials', 'Comments']],
      body: evaluations.map((ev, i) => [
        i + 1,
        ev.elder?.name || '—',
        ev.course?.title || '—',
        `${ev.contentRating}/5`,
        `${ev.teacherRating}/5`,
        `${ev.materialsRating}/5`,
        ev.comments || '—',
      ]),
    });
  }

  addFooters(doc);
  doc.save(`gitwe_amc_union_report_${Date.now()}.pdf`);
}

/**
 * Generate a trainee/attendance report PDF for Trainers.
 */
export function generateTrainerReportPDF({ courses = [], trainees = [], evaluations = [], trainerName = '' }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  drawHeader(doc, 'Trainer Course Report', trainerName);
  drawMeta(doc, [
    { label: 'Trainer', value: trainerName || '—' },
    { label: 'Courses', value: courses.length },
    { label: 'Date', value: today },
  ]);

  let y = drawSection(doc, 'Enrolled Trainees', 68);
  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [['#', 'Elder Name', 'Email', 'Phone']],
    body: trainees.length
      ? trainees.map((t, i) => [i + 1, t.name || '—', t.email || '—', t.phone || '—'])
      : [['—', 'No trainees enrolled yet', '', '']],
  });

  if (evaluations.length > 0) {
    doc.addPage();
    drawHeader(doc, 'Trainer Course Report', trainerName);
    y = drawSection(doc, 'Trainee Evaluation Feedback', 48);
    autoTable(doc, {
      ...tableStyles,
      startY: y,
      head: [['#', 'Elder', 'Course', 'Content', 'Teacher', 'Materials', 'Comments']],
      body: evaluations.map((ev, i) => [
        i + 1,
        ev.elder?.name || '—',
        ev.course?.title || '—',
        `${ev.contentRating}/5`,
        `${ev.teacherRating}/5`,
        `${ev.materialsRating}/5`,
        ev.comments || '—',
      ]),
    });
  }

  addFooters(doc);
  doc.save(`gitwe_amc_trainer_report_${Date.now()}.pdf`);
}
