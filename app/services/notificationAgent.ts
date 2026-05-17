
import { Resend } from "resend";

type NotificationStatus = "sent" | "failed" | "mocked" | "disabled";

type CaseData = {
  caseId: string;
  patientId: string;
  patientName: string;
  hospitalName: string;
  emergencyType: string;
  policyStatus: string;
  plan?: string;
  emergencyCoverage: boolean;
  preExistingConditions?: string[];
  decision: string;
  reason: string;
  hospitalAction: string;
  caseManagerAction: string;
};

type NotificationResult = {
  status: NotificationStatus;
  provider: string;
  to?: string;
  subject?: string;
  id?: string;
  error?: unknown;
  timestamp: string;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function now() {
  return new Date().toISOString();
}

function buildHospitalEmail(caseData: CaseData) {
  return `
    <h2>Nuevo ingreso de asegurado a emergencia</h2>
    <p><strong>Case ID:</strong> ${caseData.caseId}</p>
    <p><strong>Paciente:</strong> ${caseData.patientName}</p>
    <p><strong>ID Paciente:</strong> ${caseData.patientId}</p>
    <p><strong>Hospital:</strong> ${caseData.hospitalName}</p>
    <p><strong>Emergencia:</strong> ${caseData.emergencyType}</p>

    <hr />

    <h3>Validación administrativa</h3>
    <p><strong>Estado de póliza:</strong> ${caseData.policyStatus}</p>
    <p><strong>Cobertura emergencia:</strong> ${caseData.emergencyCoverage ? "Sí" : "No"}</p>
    <p><strong>Resultado:</strong> ${caseData.decision}</p>
    <p><strong>Motivo:</strong> ${caseData.reason}</p>
    <p><strong>Acción sugerida:</strong> ${caseData.hospitalAction}</p>
  `;
}

function buildCaseManagerEmail(caseData: CaseData) {
  return `
    <h2>Caso generado automáticamente</h2>
    <p><strong>Case ID:</strong> ${caseData.caseId}</p>
    <p><strong>Paciente:</strong> ${caseData.patientName}</p>
    <p><strong>ID Paciente:</strong> ${caseData.patientId}</p>
    <p><strong>Hospital:</strong> ${caseData.hospitalName}</p>
    <p><strong>Plan:</strong> ${caseData.plan ?? "No especificado"}</p>

    <hr />

    <h3>Evaluación administrativa</h3>
    <p><strong>Emergencia:</strong> ${caseData.emergencyType}</p>
    <p><strong>Preexistencias:</strong> ${(caseData.preExistingConditions ?? []).join(", ") || "Ninguna"}</p>
    <p><strong>Resultado:</strong> ${caseData.decision}</p>
    <p><strong>Motivo:</strong> ${caseData.reason}</p>
    <p><strong>Acción sugerida:</strong> ${caseData.caseManagerAction}</p>
  `;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<NotificationResult> {
  const provider = process.env.NOTIFICATION_PROVIDER ?? "mock";

  if (provider === "mock") {
    return {
      status: "mocked",
      provider: "mock",
      to: params.to,
      subject: params.subject,
      timestamp: now(),
    };
  }

  if (!resend) {
    return {
      status: "failed",
      provider: "resend",
      to: params.to,
      subject: params.subject,
      error: "RESEND_API_KEY is missing",
      timestamp: now(),
    };
  }

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Emergency Alerts <onboarding@resend.dev>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
    });

    if (response.error) {
      return {
        status: "failed",
        provider: "resend",
        to: params.to,
        subject: params.subject,
        error: response.error,
        timestamp: now(),
      };
    }

    return {
      status: "sent",
      provider: "resend",
      to: params.to,
      subject: params.subject,
      id: response.data?.id,
      timestamp: now(),
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "resend",
      to: params.to,
      subject: params.subject,
      error,
      timestamp: now(),
    };
  }
}

export async function notificationSyncAgent(caseData: CaseData) {
  const hospitalEmail = sendEmail({
    to: process.env.HOSPITAL_ADMISSIONS_EMAIL ?? "admisiones.demo@example.com",
    subject: `Ingreso emergencia - ${caseData.patientName} - ${caseData.caseId}`,
    html: buildHospitalEmail(caseData),
  });

  const caseManagerEmail = sendEmail({
    to: process.env.INSURANCE_CASE_MANAGER_EMAIL ?? "gestor.demo@example.com",
    subject: `Caso seguro generado - ${caseData.caseId}`,
    html: buildCaseManagerEmail(caseData),
  });

  const [hospitalAdmissionsEmail, insuranceCaseManagerEmail] = await Promise.all([
    hospitalEmail,
    caseManagerEmail,
  ]);

  return {
    hospitalAdmissionsEmail,
    insuranceCaseManagerEmail,

  };
}
