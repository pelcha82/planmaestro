import jsPDF from 'jspdf';

interface DailyPlanningPDFData {
  centroEducativo: string;
  docente: string;
  materia: string;
  grado: string;
  temaDia: string;
  correo?: string;
  unidad?: string;
  fechaCreacion?: string;
  competenciaEspecifica?: string;
  indicadoresLogro?: string;
  estrategiaEnsenanza?: string;
  intencionPedagogica?: string;
  actividadInicio?: string;
  actividadDesarrollo?: string;
  actividadCierre?: string;
  recursosDidacticos?: string;
  competenciaFundamentales?: string;
  ejeTransversal?: string;
  valoresYActitudes?: string;
}

interface UnitPlanningPDFData {
  centroEducativo: string;
  docente: string;
  correo?: string;
  asignatura: string;
  grado: string;
  unidad: string;
  dateRange?: string;
  presentacion_secuencia?: string;
  situacion_aprendizaje?: string;
  contenidos_procedimentales?: string;
  competencias_fundamentales?: string;
  competencias_especificas_grado?: string;
  ejes_transversal?: string;
  valores_actitudes?: string;
  indicadores_logro?: string;
  areas_articuladas?: string;
  estrategia_ensenanza_aprendizaje?: string;
  actividades_ensenanza?: string;
  actividades_aprendizaje?: string;
  actividades_evaluacion?: string;
  recursos_didacticos?: string;
  secuencia_didactica?: string;
  orientaciones_atencion_diversidad?: string;
}

// Helper function to clean text formatting and handle arrays
function cleanText(text: string): string {
  // Check if it's a JSON array
  if (typeof text === 'string' && text.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        // Convert array to bullet list with newlines
        return parsed.map((item: any) => `• ${String(item)}`).join('\n');
      }
    } catch (e) {
      // If parsing fails, continue with normal cleaning
    }
  }
  
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .trim();
}

// ===== MODERN TEMPLATE (Minimal colors, clean cards) =====
function generateDailyPlanningModern(doc: jsPDF, data: DailyPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  // Simple header with thin line
  doc.setLineWidth(0.5);
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('PLANIFICACIÓN DIARIA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Info cards - minimal style
  const cardHeight = 12;
  const cardMargin = 2;
  const colWidth = (maxWidth - cardMargin) / 2;

  const drawInfoCard = (label: string, value: string, x: number, yPos: number) => {
    // Very light gray background
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yPos, colWidth, cardHeight, 1, 1, 'FD');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), x + 3, yPos + 4);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, colWidth - 6);
    doc.text(lines[0], x + 3, yPos + 9);
  };

  const col1X = margin;
  const col2X = margin + colWidth + cardMargin;
  
  drawInfoCard('Centro Educativo', data.centroEducativo, col1X, y);
  drawInfoCard('Docente', data.docente, col2X, y);
  y += cardHeight + cardMargin;
  
  drawInfoCard('Asignatura', data.materia, col1X, y);
  drawInfoCard('Grado', data.grado, col2X, y);
  y += cardHeight + cardMargin;
  
  if (data.unidad) {
    drawInfoCard('Unidad', data.unidad, col1X, y);
    if (data.fechaCreacion) {
      drawInfoCard('Fecha', data.fechaCreacion, col2X, y);
    }
    y += cardHeight + cardMargin;
  }

  y += 5;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, maxWidth, 10, 1, 1, 'F');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tema: ${data.temaDia}`, margin + 3, y + 7);
  y += 18;

  const addSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    // Section title with more spacing
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, maxWidth, 8, 1, 1, 'FD');
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 5.5);
    y += 12; // More space after title
    
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 6);
    
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 3, y);
      y += 5;
    });
    
    y += 4; // Space after content
  };

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTRUCTURA PEDAGÓGICA', margin, y);
  y += 8;

  addSection('Intención Pedagógica', data.intencionPedagogica || '');
  addSection('Competencias Fundamentales', data.competenciaFundamentales || '');
  addSection('Competencia Específica', data.competenciaEspecifica || '');
  addSection('Eje Transversal', data.ejeTransversal || '');
  addSection('Valores y Actitudes', data.valoresYActitudes || '');
  addSection('Indicadores de Logro', data.indicadoresLogro || '');
  addSection('Estrategia de Enseñanza', data.estrategiaEnsenanza || '');

  y += 3;
  doc.setFontSize(12);
  doc.text('SECUENCIA DIDÁCTICA', margin, y);
  y += 8;

  addSection('Actividades de Inicio', data.actividadInicio || '');
  addSection('Actividades de Desarrollo', data.actividadDesarrollo || '');
  addSection('Actividades de Cierre', data.actividadCierre || '');
  addSection('Recursos Didácticos', data.recursosDidacticos || '');
}

// ===== PROFESSIONAL TEMPLATE (Formal table structure) =====
function generateDailyPlanningProfessional(doc: jsPDF, data: DailyPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  // Formal header with double line
  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PLANIFICACIÓN DIDÁCTICA DIARIA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Information table
  const cellHeight = 10;
  const labelWidth = 50;
  
  const drawTableRow = (label: string, value: string) => {
    if (y + cellHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, y, labelWidth, cellHeight);
    doc.rect(margin + labelWidth, y, maxWidth - labelWidth, cellHeight);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(label, margin + 2, y + 6.5);
    
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, maxWidth - labelWidth - 4);
    doc.text(lines[0], margin + labelWidth + 2, y + 6.5);
    
    y += cellHeight;
  };

  drawTableRow('CENTRO EDUCATIVO:', data.centroEducativo);
  drawTableRow('DOCENTE:', data.docente);
  drawTableRow('ASIGNATURA:', data.materia);
  drawTableRow('GRADO:', data.grado);
  if (data.unidad) drawTableRow('UNIDAD:', data.unidad);
  if (data.fechaCreacion) drawTableRow('FECHA:', data.fechaCreacion);
  drawTableRow('TEMA:', data.temaDia);

  y += 8;

  const addTableSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 25 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Header row with light gray
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y, maxWidth, 8, 'F');
    doc.setLineWidth(0.3);
    doc.rect(margin, y, maxWidth, 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin + 2, y + 5.5);
    y += 11; // More space after title
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 4);
    
    const contentStartY = y;
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        const contentHeight = y - contentStartY;
        doc.rect(margin, contentStartY, maxWidth, contentHeight);
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 2, y + 4);
      y += 5;
    });
    
    const contentHeight = y - contentStartY + 2;
    doc.rect(margin, contentStartY, maxWidth, contentHeight);
    y += 5; // Space after section
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. COMPONENTES PEDAGÓGICOS', margin, y);
  y += 6;

  addTableSection('INTENCIÓN PEDAGÓGICA', data.intencionPedagogica || '');
  addTableSection('COMPETENCIAS FUNDAMENTALES', data.competenciaFundamentales || '');
  addTableSection('COMPETENCIA ESPECÍFICA', data.competenciaEspecifica || '');
  addTableSection('EJE TRANSVERSAL', data.ejeTransversal || '');
  addTableSection('VALORES Y ACTITUDES', data.valoresYActitudes || '');
  addTableSection('INDICADORES DE LOGRO', data.indicadoresLogro || '');
  addTableSection('ESTRATEGIA DE ENSEÑANZA', data.estrategiaEnsenanza || '');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. DESARROLLO DE LA CLASE', margin, y);
  y += 6;

  addTableSection('INICIO', data.actividadInicio || '');
  addTableSection('DESARROLLO', data.actividadDesarrollo || '');
  addTableSection('CIERRE', data.actividadCierre || '');
  addTableSection('RECURSOS DIDÁCTICOS', data.recursosDidacticos || '');
}

// ===== CREATIVE TEMPLATE (Simple with left border accent) =====
function generateDailyPlanningCreative(doc: jsPDF, data: DailyPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  // Simple centered header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Planificación Diaria', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  // Decorative line
  doc.setLineWidth(1);
  doc.setDrawColor(150, 150, 150);
  const lineStart = pageWidth / 2 - 30;
  const lineEnd = pageWidth / 2 + 30;
  doc.line(lineStart, y, lineEnd, y);
  y += 12;

  // Info in simple list format
  const addInfoLine = (label: string, value: string) => {
    if (y + 7 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', margin, y);
    
    const labelWidth = doc.getTextWidth(label + ': ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(value, maxWidth - labelWidth - 2);
    doc.text(lines[0], margin + labelWidth, y);
    
    y += 6;
  };

  addInfoLine('Centro Educativo', data.centroEducativo);
  addInfoLine('Docente', data.docente);
  addInfoLine('Asignatura', data.materia);
  addInfoLine('Grado', data.grado);
  if (data.unidad) addInfoLine('Unidad', data.unidad);
  if (data.fechaCreacion) addInfoLine('Fecha', data.fechaCreacion);
  
  y += 5;
  // Theme box
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, y, maxWidth, 10, 1, 1, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(`Tema del Día: ${data.temaDia}`, margin + 3, y + 7);
  y += 18;

  const addSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    // Left border accent
    doc.setFillColor(180, 180, 180);
    doc.rect(margin, y, 3, 8, 'F');
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 6, y + 5.5);
    y += 12; // More space after title
    
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 6);
    
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 3, y);
      y += 5;
    });
    
    y += 4; // Space after content
  };

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estructura Pedagógica', margin, y);
  y += 8;

  addSection('Intención Pedagógica', data.intencionPedagogica || '');
  addSection('Competencias Fundamentales', data.competenciaFundamentales || '');
  addSection('Competencia Específica', data.competenciaEspecifica || '');
  addSection('Eje Transversal', data.ejeTransversal || '');
  addSection('Valores y Actitudes', data.valoresYActitudes || '');
  addSection('Indicadores de Logro', data.indicadoresLogro || '');
  addSection('Estrategia de Enseñanza', data.estrategiaEnsenanza || '');

  y += 3;
  doc.setFontSize(12);
  doc.text('Secuencia Didáctica', margin, y);
  y += 8;

  addSection('Actividades de Inicio', data.actividadInicio || '');
  addSection('Actividades de Desarrollo', data.actividadDesarrollo || '');
  addSection('Actividades de Cierre', data.actividadCierre || '');
  addSection('Recursos Didácticos', data.recursosDidacticos || '');
}

// ===== UNIT PLANNING TEMPLATES =====
function generateUnitPlanningModern(doc: jsPDF, data: UnitPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  doc.setLineWidth(0.5);
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('PLANIFICACIÓN POR UNIDAD', pageWidth / 2, y, { align: 'center' });
  y += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  const cardHeight = 12;
  const cardMargin = 2;
  const colWidth = (maxWidth - cardMargin) / 2;

  const drawInfoCard = (label: string, value: string, x: number, yPos: number) => {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yPos, colWidth, cardHeight, 1, 1, 'FD');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), x + 3, yPos + 4);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, colWidth - 6);
    doc.text(lines[0], x + 3, yPos + 9);
  };

  const col1X = margin;
  const col2X = margin + colWidth + cardMargin;
  
  drawInfoCard('Centro Educativo', data.centroEducativo, col1X, y);
  drawInfoCard('Docente', data.docente, col2X, y);
  y += cardHeight + cardMargin;
  
  drawInfoCard('Asignatura', data.asignatura, col1X, y);
  drawInfoCard('Grado', data.grado, col2X, y);
  y += cardHeight + cardMargin;
  
  drawInfoCard('Secuencia', data.unidad, col1X, y);
  if (data.correo) {
    drawInfoCard('Correo', data.correo, col2X, y);
  }
  y += cardHeight + cardMargin;

  if (data.dateRange) {
    y += 2;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, maxWidth, 10, 1, 1, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Período: ${data.dateRange}`, margin + 3, y + 7);
    y += 16;
  } else {
    y += 5;
  }

  const addSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, maxWidth, 8, 1, 1, 'FD');
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 5.5);
    y += 12;
    
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 6);
    
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 3, y);
      y += 5;
    });
    
    y += 4;
  };

  addSection('Presentación de la Secuencia', data.presentacion_secuencia || '');
  addSection('Situación de aprendizaje', data.situacion_aprendizaje || '');
  addSection('Contenidos Procedimentales', data.contenidos_procedimentales || '');
  addSection('Competencias Fundamentales', data.competencias_fundamentales || '');
  addSection('Competencias Específicas del Grado', data.competencias_especificas_grado || '');
  addSection('Ejes Transversales', data.ejes_transversal || '');
  addSection('Valores y Actitudes', data.valores_actitudes || '');
  addSection('Indicadores de Logro', data.indicadores_logro || '');
  addSection('Áreas Articuladas', data.areas_articuladas || '');
  addSection('Estrategia Enseñanza-Aprendizaje', data.estrategia_ensenanza_aprendizaje || '');
  addSection('Actividades de Enseñanza', data.actividades_ensenanza || '');
  addSection('Actividades de Aprendizaje', data.actividades_aprendizaje || '');
  addSection('Actividades de Evaluación', data.actividades_evaluacion || '');
  addSection('Recursos Didácticos', data.recursos_didacticos || '');
  addSection('Secuencia Didáctica', data.secuencia_didactica || '');
  addSection('Orientaciones para la Atención a la Diversidad', data.orientaciones_atencion_diversidad || '');
}

function generateUnitPlanningProfessional(doc: jsPDF, data: UnitPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PLANIFICACIÓN DIDÁCTICA POR UNIDAD', pageWidth / 2, y, { align: 'center' });
  y += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const cellHeight = 10;
  const labelWidth = 50;
  
  const drawTableRow = (label: string, value: string) => {
    if (y + cellHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, y, labelWidth, cellHeight);
    doc.rect(margin + labelWidth, y, maxWidth - labelWidth, cellHeight);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(label, margin + 2, y + 6.5);
    
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, maxWidth - labelWidth - 4);
    doc.text(lines[0], margin + labelWidth + 2, y + 6.5);
    
    y += cellHeight;
  };

  drawTableRow('CENTRO EDUCATIVO:', data.centroEducativo);
  drawTableRow('DOCENTE:', data.docente);
  drawTableRow('ASIGNATURA:', data.asignatura);
  drawTableRow('GRADO:', data.grado);
  drawTableRow('UNIDAD:', data.unidad);
  if (data.dateRange) drawTableRow('PERÍODO:', data.dateRange);

  y += 8;

  const addTableSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 25 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y, maxWidth, 8, 'F');
    doc.setLineWidth(0.3);
    doc.rect(margin, y, maxWidth, 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin + 2, y + 5.5);
    y += 11;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 4);
    
    const contentStartY = y;
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        const contentHeight = y - contentStartY;
        doc.rect(margin, contentStartY, maxWidth, contentHeight);
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 2, y + 4);
      y += 5;
    });
    
    const contentHeight = y - contentStartY + 2;
    doc.rect(margin, contentStartY, maxWidth, contentHeight);
    y += 5;
  };

  addTableSection('PRESENTACIÓN DE LA SECUENCIA', data.presentacion_secuencia || '');
  addTableSection('SITUACIÓN DE APRENDIZAJE', data.situacion_aprendizaje || '');
  addTableSection('CONTENIDOS PROCEDIMENTALES', data.contenidos_procedimentales || '');
  addTableSection('COMPETENCIAS FUNDAMENTALES', data.competencias_fundamentales || '');
  addTableSection('COMPETENCIAS ESPECÍFICAS DEL GRADO', data.competencias_especificas_grado || '');
  addTableSection('EJES TRANSVERSALES', data.ejes_transversal || '');
  addTableSection('VALORES Y ACTITUDES', data.valores_actitudes || '');
  addTableSection('INDICADORES DE LOGRO', data.indicadores_logro || '');
  addTableSection('ÁREAS ARTICULADAS', data.areas_articuladas || '');
  addTableSection('ESTRATEGIA ENSEÑANZA-APRENDIZAJE', data.estrategia_ensenanza_aprendizaje || '');
  addTableSection('ACTIVIDADES DE ENSEÑANZA', data.actividades_ensenanza || '');
  addTableSection('ACTIVIDADES DE APRENDIZAJE', data.actividades_aprendizaje || '');
  addTableSection('ACTIVIDADES DE EVALUACIÓN', data.actividades_evaluacion || '');
  addTableSection('RECURSOS DIDÁCTICOS', data.recursos_didacticos || '');
  addTableSection('SECUENCIA DIDÁCTICA', data.secuencia_didactica || '');
  addTableSection('ORIENTACIONES PARA LA ATENCIÓN A LA DIVERSIDAD', data.orientaciones_atencion_diversidad || '');
}

function generateUnitPlanningCreative(doc: jsPDF, data: UnitPlanningPDFData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;
  const maxWidth = pageWidth - 2 * margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Planificación por Unidad', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setLineWidth(1);
  doc.setDrawColor(150, 150, 150);
  const lineStart = pageWidth / 2 - 35;
  const lineEnd = pageWidth / 2 + 35;
  doc.line(lineStart, y, lineEnd, y);
  y += 12;

  const addInfoLine = (label: string, value: string) => {
    if (y + 7 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', margin, y);
    
    const labelWidth = doc.getTextWidth(label + ': ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(value, maxWidth - labelWidth - 2);
    doc.text(lines[0], margin + labelWidth, y);
    
    y += 6;
  };

  addInfoLine('Centro Educativo', data.centroEducativo);
  addInfoLine('Docente', data.docente);
  addInfoLine('Asignatura', data.asignatura);
  addInfoLine('Grado', data.grado);
  addInfoLine('Secuencia', data.unidad);
  if (data.correo) addInfoLine('Correo', data.correo);
  if (data.dateRange) addInfoLine('Período', data.dateRange);
  
  y += 8;

  const addSection = (title: string, content: string) => {
    if (!content) return;
    
    const cleanContent = cleanText(content);
    
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFillColor(180, 180, 180);
    doc.rect(margin, y, 3, 8, 'F');
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 6, y + 5.5);
    y += 12;
    
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(cleanContent, maxWidth - 6);
    
    lines.forEach((line: string) => {
      if (y + 5 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 3, y);
      y += 5;
    });
    
    y += 4;
  };

  addSection('Presentación de la Secuencia', data.presentacion_secuencia || '');
  addSection('Situación de aprendizaje', data.situacion_aprendizaje || '');
  addSection('Contenidos Procedimentales', data.contenidos_procedimentales || '');
  addSection('Competencias Fundamentales', data.competencias_fundamentales || '');
  addSection('Competencias Específicas del Grado', data.competencias_especificas_grado || '');
  addSection('Ejes Transversales', data.ejes_transversal || '');
  addSection('Valores y Actitudes', data.valores_actitudes || '');
  addSection('Indicadores de Logro', data.indicadores_logro || '');
  addSection('Áreas Articuladas', data.areas_articuladas || '');
  addSection('Estrategia Enseñanza-Aprendizaje', data.estrategia_ensenanza_aprendizaje || '');
  addSection('Actividades de Enseñanza', data.actividades_ensenanza || '');
  addSection('Actividades de Aprendizaje', data.actividades_aprendizaje || '');
  addSection('Actividades de Evaluación', data.actividades_evaluacion || '');
  addSection('Recursos Didácticos', data.recursos_didacticos || '');
  addSection('Secuencia Didáctica', data.secuencia_didactica || '');
  addSection('Orientaciones para la Atención a la Diversidad', data.orientaciones_atencion_diversidad || '');
}

// ===== MAIN EXPORT FUNCTIONS =====
export function generateDailyPlanningPDF(data: DailyPlanningPDFData, template: 'modern' | 'professional' | 'creative' = 'modern') {
  const doc = new jsPDF();
  
  if (template === 'modern') {
    generateDailyPlanningModern(doc, data);
  } else if (template === 'professional') {
    generateDailyPlanningProfessional(doc, data);
  } else {
    generateDailyPlanningCreative(doc, data);
  }

  const fileName = `Planificacion_Diaria_${data.temaDia.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

export function generateUnitPlanningPDF(data: UnitPlanningPDFData, template: 'modern' | 'professional' | 'creative' = 'modern') {
  const doc = new jsPDF();
  
  if (template === 'modern') {
    generateUnitPlanningModern(doc, data);
  } else if (template === 'professional') {
    generateUnitPlanningProfessional(doc, data);
  } else {
    generateUnitPlanningCreative(doc, data);
  }

  const fileName = `Planificacion_Unidad_${data.unidad.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}
