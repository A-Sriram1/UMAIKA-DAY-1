// API client for communicating with the FastAPI backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const res = await fetch(`${API_BASE}/api/upload/`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUploadStatus() {
  const res = await fetch(`${API_BASE}/api/upload/status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function previewDataset(datasetId: string, page = 1, pageSize = 100) {
  const res = await fetch(`${API_BASE}/api/preview/${datasetId}?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cleanDataset(datasetId: string, operations: string[]) {
  const res = await fetch(`${API_BASE}/api/clean/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, operations }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateSchema(datasetIds: string[]) {
  const res = await fetch(`${API_BASE}/api/schema/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_ids: datasetIds }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function validateDataset(datasetId: string) {
  const res = await fetch(`${API_BASE}/api/validate/${datasetId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getExportUrl(datasetId: string, format: 'csv' | 'excel' | 'sql') {
  return `${API_BASE}/api/export/${datasetId}/${format}`;
}

export function getReportUrl(datasetId: string) {
  return `${API_BASE}/api/report/${datasetId}/pdf`;
}
