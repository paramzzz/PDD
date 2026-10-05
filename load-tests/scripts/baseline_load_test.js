import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Target parameters via environment variables
const BASE_URL = __ENV.LOAD_TEST_BASE_URL || 'http://localhost:8000';
const EMAIL = __ENV.LOAD_TEST_EMAIL || 'doctor@clearpath.ai';
const PASSWORD = __ENV.LOAD_TEST_PASSWORD || 'doctor123';

// Custom trends per endpoint for detailed breakdown
const endpointTrends = {
  'GET /health': new Trend('ep_health_ms'),
  'POST /login': new Trend('ep_login_ms'),
  'GET /patients': new Trend('ep_patients_ms'),
  'GET /api/patient-detail': new Trend('ep_patient_detail_ms'),
  'GET /api/dashboard-stats': new Trend('ep_dashboard_stats_ms'),
  'GET /api/dashboard/critical': new Trend('ep_dashboard_critical_ms'),
  'GET /api/dashboard/pending-verification': new Trend('ep_dashboard_pending_ms'),
  'GET /api/dashboard/cleared': new Trend('ep_dashboard_cleared_ms'),
  'GET /api/dashboard/approval-time': new Trend('ep_approval_time_ms'),
  'GET /api/dashboard/analytics': new Trend('ep_analytics_ms'),
  'GET /api/nurses': new Trend('ep_nurses_ms'),
  'GET /api/notifications': new Trend('ep_notifications_ms'),
  'GET /api/documents/pending': new Trend('ep_documents_pending_ms'),
  'GET /api/documents/archive': new Trend('ep_documents_archive_ms'),
  'POST /api/copilot/query': new Trend('ep_copilot_query_ms'),
};

const endpointErrors = {
  'GET /health': new Counter('ep_health_err'),
  'POST /login': new Counter('ep_login_err'),
  'GET /patients': new Counter('ep_patients_err'),
  'GET /api/patient-detail': new Counter('ep_patient_detail_err'),
  'GET /api/dashboard-stats': new Counter('ep_dashboard_stats_err'),
  'GET /api/dashboard/critical': new Counter('ep_dashboard_critical_err'),
  'GET /api/dashboard/pending-verification': new Counter('ep_dashboard_pending_err'),
  'GET /api/dashboard/cleared': new Counter('ep_dashboard_cleared_err'),
  'GET /api/dashboard/approval-time': new Counter('ep_approval_time_err'),
  'GET /api/dashboard/analytics': new Counter('ep_analytics_err'),
  'GET /api/nurses': new Counter('ep_nurses_err'),
  'GET /api/notifications': new Counter('ep_notifications_err'),
  'GET /api/documents/pending': new Counter('ep_documents_pending_err'),
  'GET /api/documents/archive': new Counter('ep_documents_archive_err'),
  'POST /api/copilot/query': new Counter('ep_copilot_query_err'),
};

const statusCounters = {
  '200': new Counter('status_200'),
  '201': new Counter('status_201'),
  '400': new Counter('status_400'),
  '401': new Counter('status_401'),
  '403': new Counter('status_403'),
  '404': new Counter('status_404'),
  '422': new Counter('status_422'),
  '500': new Counter('status_500'),
  '502': new Counter('status_502'),
  '503': new Counter('status_503'),
};

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  stages: [
    { duration: '15s', target: 100 }, // Stage 1: Ramp Up (0 -> 100 VUs)
    { duration: '30s', target: 100 }, // Stage 2: Sustained Load (100 VUs)
    { duration: '15s', target: 0 },   // Stage 3: Ramp Down (100 -> 0 VUs)
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],                   // Error rate < 5%
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // P95 < 1000ms, P99 < 2000ms
  },
};

export function setup() {
  console.log(`[ClearPath Load Test] Initializing test setup against ${BASE_URL}`);
  
  const payload = JSON.stringify({ email: EMAIL, password: PASSWORD, role: 'DOCTOR' });
  const params = { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /login' } };
  const res = http.post(`${BASE_URL}/login`, payload, params);
  
  let userId = 1;
  if (res.status === 200) {
    try {
      const json = res.json();
      if (json && json.user_id) {
        userId = json.user_id;
      }
    } catch (e) {}
  }
  
  return { baseUrl: BASE_URL, userId: userId };
}

export default function (data) {
  const baseUrl = data.baseUrl || BASE_URL;
  const userId = data.userId || 1;

  const requests = [
    { method: 'GET', url: `${baseUrl}/health`, tag: 'GET /health' },
    { method: 'POST', url: `${baseUrl}/login`, body: JSON.stringify({ email: EMAIL, password: PASSWORD, role: 'DOCTOR' }), tag: 'POST /login', isJson: true },
    { method: 'GET', url: `${baseUrl}/patients`, tag: 'GET /patients' },
    { method: 'GET', url: `${baseUrl}/api/patient-detail?id=${userId}`, tag: 'GET /api/patient-detail' },
    { method: 'GET', url: `${baseUrl}/api/dashboard-stats`, tag: 'GET /api/dashboard-stats' },
    { method: 'GET', url: `${baseUrl}/api/dashboard/critical`, tag: 'GET /api/dashboard/critical' },
    { method: 'GET', url: `${baseUrl}/api/dashboard/pending-verification`, tag: 'GET /api/dashboard/pending-verification' },
    { method: 'GET', url: `${baseUrl}/api/dashboard/cleared`, tag: 'GET /api/dashboard/cleared' },
    { method: 'GET', url: `${baseUrl}/api/dashboard/approval-time`, tag: 'GET /api/dashboard/approval-time' },
    { method: 'GET', url: `${baseUrl}/api/dashboard/analytics`, tag: 'GET /api/dashboard/analytics' },
    { method: 'GET', url: `${baseUrl}/api/nurses`, tag: 'GET /api/nurses' },
    { method: 'GET', url: `${baseUrl}/api/notifications`, tag: 'GET /api/notifications' },
    { method: 'GET', url: `${baseUrl}/api/documents/pending`, tag: 'GET /api/documents/pending' },
    { method: 'GET', url: `${baseUrl}/api/documents/archive`, tag: 'GET /api/documents/archive' },
    { method: 'POST', url: `${baseUrl}/api/copilot/query`, body: JSON.stringify({ query: 'patient status summary', patient_id: userId }), tag: 'POST /api/copilot/query', isJson: true }
  ];

  const req = requests[Math.floor(Math.random() * requests.length)];

  let res;
  if (req.method === 'GET') {
    res = http.get(req.url, { tags: { name: req.tag } });
  } else if (req.method === 'POST') {
    const opts = req.isJson ? { headers: { 'Content-Type': 'application/json' }, tags: { name: req.tag } } : { tags: { name: req.tag } };
    res = http.post(req.url, req.body, opts);
  }

  // Record metrics
  if (res) {
    if (endpointTrends[req.tag]) {
      endpointTrends[req.tag].add(res.timings.duration);
    }
    const statusStr = res.status.toString();
    if (statusCounters[statusStr]) {
      statusCounters[statusStr].add(1);
    }
    if (res.status !== 200 && res.status !== 201) {
      if (endpointErrors[req.tag]) {
        endpointErrors[req.tag].add(1);
      }
    }
  }

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  // Small pacing think time
  sleep(0.1 + Math.random() * 0.2);
}

export function handleSummary(data) {
  return {
    'reports/json/ClearPath_Load_Test_Raw.json': JSON.stringify(data, null, 2),
  };
}
