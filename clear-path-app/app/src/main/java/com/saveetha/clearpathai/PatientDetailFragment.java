package com.saveetha.clearpathai;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import com.saveetha.clearpathai.PatientDetailFetchResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientDetailFragment extends Fragment implements View.OnClickListener {

    private static final String ARG_PATIENT_ID = "patient_id";
    private int patientId;

    // Outer View Header Components
    private TextView tvDetailName, tvDetailMeta, tvDetailRiskTag;
    private TextView tabOverview, tabAiAnalysis, tabRiskScore, tabInsurance, tabPreOp, tabApproval;
    private TextView selectedTab;

    // Visibility Content Containers
    private LinearLayout containerOverview, containerAiAnalysis, containerRiskScore, containerInsurance, containerPreOp, containerApproval;

    // Overview Components
    private TextView tvDetailBp, tvDetailHr, tvDetailTemp, tvDetailSpo2, tvDetailComplaint;
    private LinearLayout layoutClearanceInsurance, layoutClearanceFinance, layoutClearanceClinical;
    private TextView tvClearanceInsuranceValue, tvClearanceFinanceValue, tvClearanceClinicalValue;
    private TextView btnRunClearances;

    // AI Analysis View Field Targets
    private TextView tvAiSymptom1, tvAiSymptom2, tvAiSymptom3;
    private TextView tvAiInsight1, tvAiInsight2, tvAiScanInterpretation, tvAiBillingVerification;

    // Risk Scoring Engine Component Targets
    private TextView tvRiskEngineTitle, tvDialScore, tvDialBadge;
    private TextView tvMetricUrgency, tvMetricSeverity, tvMetricAbnormality, tvMetricInsurance, tvRiskBannerText;
    private ProgressBar pbUrgency, pbSeverity, pbAbnormality, pbInsurance;
    private LinearLayout layoutRiskBanner;

    // Insurance Tab Components
    private TextView tvInsuranceProvider, tvInsurancePolicy, tvInsuranceStatusBadge, tvInsuranceCoveragePercent, tvInsuranceCopay, tvInsuranceDues, tvInsuranceDetailsText;
    private ProgressBar pbInsuranceCoverage;
    private LinearLayout layoutInsuranceClearanceBox, layoutFinanceClearanceBox, layoutClinicalClearanceBox;
    private TextView tvInsuranceClearanceText, tvFinanceClearanceText, tvClinicalClearanceText;
    private TextView btnReRunVerification;

    // Pre-Op Tab Components
    private TextView tvPreOpStatusBadge, btnSubmitPreOp;
    private CheckBox cbPreOpNpo, cbPreOpConsent, cbPreOpLabs, cbPreOpAnesthesia;

    // Approval Tab Components
    private TextView tvApprovalStatusBadge, tvApprovalStatusClearances, tvApprovalStatusPreop, btnApproveAdmission;
    private CheckBox cbSignoffDoctor, cbSignoffAdmin;

    public static PatientDetailFragment newInstance(int patientId) {
        PatientDetailFragment fragment = new PatientDetailFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PATIENT_ID, patientId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            patientId = getArguments().getInt(ARG_PATIENT_ID);
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_detail, container, false);

        // Bind Base Header and Layout Controllers
        tvDetailName = view.findViewById(R.id.tvDetailName);
        tvDetailMeta = view.findViewById(R.id.tvDetailMeta);
        tvDetailRiskTag = view.findViewById(R.id.tvDetailRiskTag);

        tabOverview = view.findViewById(R.id.tabOverview);
        tabAiAnalysis = view.findViewById(R.id.tabAiAnalysis);
        tabRiskScore = view.findViewById(R.id.tabRiskScore);
        tabInsurance = view.findViewById(R.id.tabInsurance);
        tabPreOp = view.findViewById(R.id.tabPreOp);
        tabApproval = view.findViewById(R.id.tabApproval);

        containerOverview = view.findViewById(R.id.containerOverview);
        containerAiAnalysis = view.findViewById(R.id.containerAiAnalysis);
        containerRiskScore = view.findViewById(R.id.containerRiskScore);
        containerInsurance = view.findViewById(R.id.containerInsurance);
        containerPreOp = view.findViewById(R.id.containerPreOp);
        containerApproval = view.findViewById(R.id.containerApproval);

        // Bind Overview Elements
        tvDetailBp = view.findViewById(R.id.tvDetailBp);
        tvDetailHr = view.findViewById(R.id.tvDetailHr);
        tvDetailTemp = view.findViewById(R.id.tvDetailTemp);
        tvDetailSpo2 = view.findViewById(R.id.tvDetailSpo2);
        tvDetailComplaint = view.findViewById(R.id.tvDetailComplaint);

        layoutClearanceInsurance = view.findViewById(R.id.layoutClearanceInsurance);
        layoutClearanceFinance = view.findViewById(R.id.layoutClearanceFinance);
        layoutClearanceClinical = view.findViewById(R.id.layoutClearanceClinical);
        tvClearanceInsuranceValue = view.findViewById(R.id.tvClearanceInsuranceValue);
        tvClearanceFinanceValue = view.findViewById(R.id.tvClearanceFinanceValue);
        tvClearanceClinicalValue = view.findViewById(R.id.tvClearanceClinicalValue);
        btnRunClearances = view.findViewById(R.id.btnRunClearances);

        // Bind AI Analysis Elements
        tvAiSymptom1 = view.findViewById(R.id.tvAiSymptom1);
        tvAiSymptom2 = view.findViewById(R.id.tvAiSymptom2);
        tvAiSymptom3 = view.findViewById(R.id.tvAiSymptom3);
        tvAiInsight1 = view.findViewById(R.id.tvAiInsight1);
        tvAiInsight2 = view.findViewById(R.id.tvAiInsight2);
        tvAiScanInterpretation = view.findViewById(R.id.tvAiScanInterpretation);
        tvAiBillingVerification = view.findViewById(R.id.tvAiBillingVerification);

        // Bind Risk Scoring Engine Components
        tvRiskEngineTitle = view.findViewById(R.id.tvRiskEngineTitle);
        tvDialScore = view.findViewById(R.id.tvDialScore);
        tvDialBadge = view.findViewById(R.id.tvDialBadge);
        tvMetricUrgency = view.findViewById(R.id.tvMetricUrgency);
        tvMetricSeverity = view.findViewById(R.id.tvMetricSeverity);
        tvMetricAbnormality = view.findViewById(R.id.tvMetricAbnormality);
        tvMetricInsurance = view.findViewById(R.id.tvMetricInsurance);
        tvRiskBannerText = view.findViewById(R.id.tvRiskBannerText);
        pbUrgency = view.findViewById(R.id.pbUrgency);
        pbSeverity = view.findViewById(R.id.pbSeverity);
        pbAbnormality = view.findViewById(R.id.pbAbnormality);
        pbInsurance = view.findViewById(R.id.pbInsurance);
        layoutRiskBanner = view.findViewById(R.id.layoutRiskBanner);

        // Bind Insurance Elements
        tvInsuranceProvider = view.findViewById(R.id.tvInsuranceProvider);
        tvInsurancePolicy = view.findViewById(R.id.tvInsurancePolicy);
        tvInsuranceStatusBadge = view.findViewById(R.id.tvInsuranceStatusBadge);
        tvInsuranceCoveragePercent = view.findViewById(R.id.tvInsuranceCoveragePercent);
        tvInsuranceCopay = view.findViewById(R.id.tvInsuranceCopay);
        tvInsuranceDues = view.findViewById(R.id.tvInsuranceDues);
        tvInsuranceDetailsText = view.findViewById(R.id.tvInsuranceDetailsText);
        pbInsuranceCoverage = view.findViewById(R.id.pbInsuranceCoverage);
        layoutInsuranceClearanceBox = view.findViewById(R.id.layoutInsuranceClearanceBox);
        layoutFinanceClearanceBox = view.findViewById(R.id.layoutFinanceClearanceBox);
        layoutClinicalClearanceBox = view.findViewById(R.id.layoutClinicalClearanceBox);
        tvInsuranceClearanceText = view.findViewById(R.id.tvInsuranceClearanceText);
        tvFinanceClearanceText = view.findViewById(R.id.tvFinanceClearanceText);
        tvClinicalClearanceText = view.findViewById(R.id.tvClinicalClearanceText);
        btnReRunVerification = view.findViewById(R.id.btnReRunVerification);

        // Bind Pre-Op Elements
        tvPreOpStatusBadge = view.findViewById(R.id.tvPreOpStatusBadge);
        btnSubmitPreOp = view.findViewById(R.id.btnSubmitPreOp);
        cbPreOpNpo = view.findViewById(R.id.cbPreOpNpo);
        cbPreOpConsent = view.findViewById(R.id.cbPreOpConsent);
        cbPreOpLabs = view.findViewById(R.id.cbPreOpLabs);
        cbPreOpAnesthesia = view.findViewById(R.id.cbPreOpAnesthesia);

        // Bind Approval Elements
        tvApprovalStatusBadge = view.findViewById(R.id.tvApprovalStatusBadge);
        tvApprovalStatusClearances = view.findViewById(R.id.tvApprovalStatusClearances);
        tvApprovalStatusPreop = view.findViewById(R.id.tvApprovalStatusPreop);
        btnApproveAdmission = view.findViewById(R.id.btnApproveAdmission);
        cbSignoffDoctor = view.findViewById(R.id.cbSignoffDoctor);
        cbSignoffAdmin = view.findViewById(R.id.cbSignoffAdmin);

        // Configure Navigation Click Listeners
        tabOverview.setOnClickListener(this);
        tabAiAnalysis.setOnClickListener(this);
        tabRiskScore.setOnClickListener(this);
        tabInsurance.setOnClickListener(this);
        tabPreOp.setOnClickListener(this);
        tabApproval.setOnClickListener(this);

        btnRunClearances.setOnClickListener(this);
        btnReRunVerification.setOnClickListener(this);
        btnSubmitPreOp.setOnClickListener(this);
        btnApproveAdmission.setOnClickListener(this);

        selectedTab = tabOverview;

        // Run dynamic query extraction sequence
        fetchPatientDetails();

        return view;
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        if (id == R.id.tabOverview || id == R.id.tabAiAnalysis || id == R.id.tabRiskScore ||
            id == R.id.tabInsurance || id == R.id.tabPreOp || id == R.id.tabApproval) {
            toggleTabHighlight((TextView) v);

            // Transition content visibilities based on tab clicks
            containerOverview.setVisibility(id == R.id.tabOverview ? View.VISIBLE : View.GONE);
            containerAiAnalysis.setVisibility(id == R.id.tabAiAnalysis ? View.VISIBLE : View.GONE);
            containerRiskScore.setVisibility(id == R.id.tabRiskScore ? View.VISIBLE : View.GONE);
            containerInsurance.setVisibility(id == R.id.tabInsurance ? View.VISIBLE : View.GONE);
            containerPreOp.setVisibility(id == R.id.tabPreOp ? View.VISIBLE : View.GONE);
            containerApproval.setVisibility(id == R.id.tabApproval ? View.VISIBLE : View.GONE);
        } else if (id == R.id.btnRunClearances || id == R.id.btnReRunVerification) {
            runClearancesSequence();
        } else if (id == R.id.btnSubmitPreOp) {
            submitPreOpReadiness();
        } else if (id == R.id.btnApproveAdmission) {
            approveAdmissionWorkflow();
        }
    }

    private void toggleTabHighlight(TextView activeTab) {
        selectedTab.setBackgroundResource(R.drawable.chip_inactive_bg);
        selectedTab.setTextColor(Color.parseColor("#DFF7FB"));
        activeTab.setBackgroundResource(R.drawable.chip_active_bg);
        activeTab.setTextColor(Color.parseColor("#FFFFFF"));
        selectedTab = activeTab;
    }

    private void fetchPatientDetails() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.getPatientById(patientId).enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                }
            }
            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Network Sync Error: ", t);
            }
        });
    }

    private void runClearancesSequence() {
        // Show immediate simulated progress state
        if (tvClearanceInsuranceValue != null) tvClearanceInsuranceValue.setText("Checking...");
        if (tvClearanceClinicalValue != null) tvClearanceClinicalValue.setText("Checking...");
        if (layoutClearanceInsurance != null) layoutClearanceInsurance.setBackgroundColor(Color.parseColor("#F0F9FB"));
        if (layoutClearanceClinical != null) layoutClearanceClinical.setBackgroundColor(Color.parseColor("#F0F9FB"));

        if (tvInsuranceClearanceText != null) tvInsuranceClearanceText.setText("Checking...");
        if (tvClinicalClearanceText != null) tvClinicalClearanceText.setText("Checking...");
        if (layoutInsuranceClearanceBox != null) layoutInsuranceClearanceBox.setBackgroundColor(Color.parseColor("#F0F9FB"));
        if (layoutClinicalClearanceBox != null) layoutClinicalClearanceBox.setBackgroundColor(Color.parseColor("#F0F9FB"));

        Toast.makeText(getContext(), "Running dual clearance verification...", Toast.LENGTH_SHORT).show();

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.runClearance(patientId).enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                    Toast.makeText(getContext(), "Verification complete. All Clearances Approved!", Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(getContext(), "Failed to verify clearances on server.", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Clearance Sync Error: ", t);
                Toast.makeText(getContext(), "Network link failed.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void submitPreOpReadiness() {
        boolean npo = cbPreOpNpo.isChecked();
        boolean consent = cbPreOpConsent.isChecked();
        boolean labs = cbPreOpLabs.isChecked();
        boolean anesthesia = cbPreOpAnesthesia.isChecked();

        String status = "In Progress";
        if (npo && consent && labs && anesthesia) {
            status = "Completed";
        }

        Toast.makeText(getContext(), "Saving Pre-Op Readiness status...", Toast.LENGTH_SHORT).show();

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.updatePatientStatus(patientId, status, null).enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                    Toast.makeText(getContext(), "Pre-Op readiness status updated!", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Pre-op Status Update Failed: ", t);
                Toast.makeText(getContext(), "Failed to update Pre-Op status.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void approveAdmissionWorkflow() {
        if (!cbSignoffDoctor.isChecked() || !cbSignoffAdmin.isChecked()) {
            Toast.makeText(getContext(), "Please obtain all physician and admin sign-offs first.", Toast.LENGTH_LONG).show();
            return;
        }

        Toast.makeText(getContext(), "Submitting final admission sign-off...", Toast.LENGTH_SHORT).show();

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.updatePatientStatus(patientId, null, "Approved").enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                    Toast.makeText(getContext(), "ADMISSION COMPLETED! Patient fast-tracked to Ward.", Toast.LENGTH_LONG).show();
                }
            }
            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Final Approval Failed: ", t);
                Toast.makeText(getContext(), "Failed to submit admission approval.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateClearanceBox(LinearLayout layout, TextView valueTv, String status) {
        if (layout == null || valueTv == null) return;
        valueTv.setText(status);
        if ("Cleared".equalsIgnoreCase(status)) {
            layout.setBackgroundColor(Color.parseColor("#E8F5E9")); // light green
            valueTv.setTextColor(Color.parseColor("#2E7D32")); // dark green
            valueTv.setTypeface(null, android.graphics.Typeface.BOLD);
        } else if ("Flagged".equalsIgnoreCase(status)) {
            layout.setBackgroundColor(Color.parseColor("#FFE5E5")); // light red
            valueTv.setTextColor(Color.parseColor("#F44336")); // red
            valueTv.setTypeface(null, android.graphics.Typeface.BOLD);
        } else {
            // Checking... or Pending
            layout.setBackgroundColor(Color.parseColor("#F0F9FB")); // light blue/teal
            valueTv.setTextColor(Color.parseColor("#546E7A")); // grey-blue
            valueTv.setTypeface(null, android.graphics.Typeface.NORMAL);
        }
    }

    private void populateUI(PatientDetailFetchResponse data) {
        if (data == null) return;

        tvDetailName.setText(data.getFullName());
        tvDetailMeta.setText(data.getAge() + " · " + data.getGender() + " · Arrived " + data.getTimeElapsed());

        String risk = data.getInitialRisk() != null ? data.getInitialRisk().toUpperCase() : "LOW";
        tvDetailRiskTag.setText(risk);

        if (risk.contains("STAT")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#F44336"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFE5E5"));
        } else if (risk.contains("HIGH")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#FF9800"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFF3E0"));
        } else {
            tvDetailRiskTag.setTextColor(Color.parseColor("#4CAF50"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#E8F5E9"));
        }

        tvDetailBp.setText(data.getBp().replace("BP ", ""));
        tvDetailHr.setText(data.getHr() + " bpm");

        String temp = data.getTemperature();
        tvDetailTemp.setText(temp.contains("°C") ? temp : temp + "°C");

        String o2 = data.getSpo2();
        tvDetailSpo2.setText(o2.contains("%") ? o2 : o2 + "%");

        tvDetailComplaint.setText(data.getChiefComplaint());

        // Fill Tab 1: Dynamic clearances in Overview
        updateClearanceBox(layoutClearanceInsurance, tvClearanceInsuranceValue, data.getInsuranceStatus());
        updateClearanceBox(layoutClearanceFinance, tvClearanceFinanceValue, data.getFinanceStatus());
        updateClearanceBox(layoutClearanceClinical, tvClearanceClinicalValue, data.getClinicalStatus());

        if ("Cleared".equalsIgnoreCase(data.getInsuranceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getFinanceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getClinicalStatus())) {
            btnRunClearances.setText("Re-run Verification");
        } else {
            btnRunClearances.setText("Run All Clearances Simultaneously");
        }

        // Fill Tab 2: AI Analysis Fields
        if (risk.contains("STAT")) {
            tvAiSymptom1.setText("Chest pain (left-sided)");
            tvAiSymptom2.setText("Diaphoresis");
            tvAiSymptom3.setText("Dyspnea");
            tvAiInsight1.setText("• ST-elevation pattern (V1-V4) — STEMI protocol");
            tvAiInsight2.setText("• Troponin I elevated 2.4 ng/mL confirms myocardial injury");
            tvAiScanInterpretation.setText("ECG: ST elevation V1-V4, STEMI. Immediate cath lab activation recommended. No prior imaging available.");
            tvAiBillingVerification.setText("• 85% coverage confirmed. ₹18,000 co-pay at admission. Emergency protocol waiver eligible.");
        } else {
            tvAiSymptom1.setText("Abdominal Pain");
            tvAiSymptom2.setText("Nausea");
            tvAiSymptom3.setText("Tenderness");
            tvAiInsight1.setText("• Localized tenderness noted in lower right quadrant.");
            tvAiInsight2.setText("• White blood cell parameters show mild elevated tracking metrics.");
            tvAiScanInterpretation.setText("Ultrasound requested. Evaluation pending confirmation protocols.");
            tvAiBillingVerification.setText("• Coverage profile active. Checking eligibility rules updates.");
        }

        // Fill Tab 3: Risk Score Dashboard Fields dynamically based on triage tiers
        tvRiskEngineTitle.setText(risk + " RISK SCORING ENGINE");
        tvDialBadge.setText(risk);

        if (risk.contains("STAT")) {
            tvDialScore.setText("9.5");
            tvDialScore.setTextColor(Color.parseColor("#F44336"));
            tvMetricUrgency.setText("Critical");
            tvMetricUrgency.setTextColor(Color.parseColor("#F44336"));
            pbUrgency.setProgress(95);
            pbUrgency.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F44336")));

            tvMetricSeverity.setText("Severe");
            tvMetricSeverity.setTextColor(Color.parseColor("#00838F"));
            pbSeverity.setProgress(88);
            pbSeverity.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00838F")));

            tvMetricAbnormality.setText("Detected");
            tvMetricAbnormality.setTextColor(Color.parseColor("#EF6C00"));
            pbAbnormality.setProgress(75);
            pbAbnormality.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#EF6C00")));

            layoutRiskBanner.setVisibility(View.VISIBLE);
        } else {
            // Safe fallback configuration rules for Low/Medium triage instances
            tvDialScore.setText("4.2");
            tvDialScore.setTextColor(Color.parseColor("#2E7D32"));
            tvMetricUrgency.setText("Moderate");
            tvMetricUrgency.setTextColor(Color.parseColor("#EF6C00"));
            pbUrgency.setProgress(42);
            pbUrgency.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#EF6C00")));

            tvMetricSeverity.setText("Mild");
            tvMetricSeverity.setTextColor(Color.parseColor("#2E7D32"));
            pbSeverity.setProgress(30);
            pbSeverity.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#2E7D32")));

            tvMetricAbnormality.setText("None");
            tvMetricAbnormality.setTextColor(Color.parseColor("#90A4AE"));
            pbAbnormality.setProgress(10);
            pbAbnormality.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#90A4AE")));

            layoutRiskBanner.setVisibility(View.GONE);
        }

        // Fill Tab 4: Insurance Details
        tvInsuranceProvider.setText(data.getInsuranceProvider());
        tvInsurancePolicy.setText("Policy: " + data.getPolicyNumber());
        tvInsuranceStatusBadge.setText(data.getInsuranceStatus());
        if ("Cleared".equalsIgnoreCase(data.getInsuranceStatus())) {
            tvInsuranceStatusBadge.setTextColor(Color.parseColor("#2E7D32"));
            tvInsuranceStatusBadge.setBackgroundColor(Color.parseColor("#E8F5E9"));
        } else {
            tvInsuranceStatusBadge.setTextColor(Color.parseColor("#0F98B8"));
            tvInsuranceStatusBadge.setBackgroundColor(Color.parseColor("#E0F7FA"));
        }

        pbInsuranceCoverage.setProgress(data.getCoveragePercent());
        tvInsuranceCoveragePercent.setText(data.getCoveragePercent() + "% covered");
        tvInsuranceCopay.setText("₹" + String.format("%,d", data.getCoPay()));
        tvInsuranceDues.setText("₹" + String.format("%,d", data.getUnpaidDues()));
        tvInsuranceDetailsText.setText(data.getCoverageDetails());

        updateClearanceBox(layoutInsuranceClearanceBox, tvInsuranceClearanceText, data.getInsuranceStatus());
        updateClearanceBox(layoutFinanceClearanceBox, tvFinanceClearanceText, data.getFinanceStatus());
        updateClearanceBox(layoutClinicalClearanceBox, tvClinicalClearanceText, data.getClinicalStatus());

        if ("Cleared".equalsIgnoreCase(data.getInsuranceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getFinanceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getClinicalStatus())) {
            btnReRunVerification.setText("Verification Completed");
            btnReRunVerification.setBackgroundColor(Color.parseColor("#4CAF50")); // green
        } else {
            btnReRunVerification.setText("Re-run Verification");
            btnReRunVerification.setBackgroundColor(Color.parseColor("#0F98B8")); // teal
        }

        // Fill Tab 5: Pre-Op Details
        tvPreOpStatusBadge.setText(data.getPreOpStatus());
        if ("Completed".equalsIgnoreCase(data.getPreOpStatus())) {
            tvPreOpStatusBadge.setTextColor(Color.parseColor("#2E7D32"));
            tvPreOpStatusBadge.setBackgroundColor(Color.parseColor("#E8F5E9"));
            btnSubmitPreOp.setText("Pre-Op Verification Completed");
            btnSubmitPreOp.setBackgroundColor(Color.parseColor("#4CAF50"));
            cbPreOpNpo.setChecked(true);
            cbPreOpConsent.setChecked(true);
            cbPreOpLabs.setChecked(true);
            cbPreOpAnesthesia.setChecked(true);
        } else {
            tvPreOpStatusBadge.setTextColor(Color.parseColor("#E65100"));
            tvPreOpStatusBadge.setBackgroundColor(Color.parseColor("#FFE0B2"));
            btnSubmitPreOp.setText("Complete Pre-Op Verification");
            btnSubmitPreOp.setBackgroundColor(Color.parseColor("#E65100"));
        }

        // Fill Tab 6: Approval Details
        tvApprovalStatusBadge.setText(data.getApprovalStatus());
        if ("Approved".equalsIgnoreCase(data.getApprovalStatus())) {
            tvApprovalStatusBadge.setTextColor(Color.parseColor("#2E7D32"));
            tvApprovalStatusBadge.setBackgroundColor(Color.parseColor("#E8F5E9"));
            btnApproveAdmission.setText("Admission Approved & Dispatched");
            btnApproveAdmission.setBackgroundColor(Color.parseColor("#4CAF50"));
            cbSignoffDoctor.setChecked(true);
            cbSignoffAdmin.setChecked(true);
        } else {
            tvApprovalStatusBadge.setTextColor(Color.parseColor("#E65100"));
            tvApprovalStatusBadge.setBackgroundColor(Color.parseColor("#FFE0B2"));
            btnApproveAdmission.setText("Approve & Fast-Track Admission");
            btnApproveAdmission.setBackgroundColor(Color.parseColor("#37474F"));
        }

        // Summary checks inside Approval tab
        if ("Cleared".equalsIgnoreCase(data.getInsuranceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getFinanceStatus()) && 
            "Cleared".equalsIgnoreCase(data.getClinicalStatus())) {
            tvApprovalStatusClearances.setText("✓ Clearances Checked: Insurance, Finance, Clinical");
            tvApprovalStatusClearances.setTextColor(Color.parseColor("#2E7D32"));
        } else {
            tvApprovalStatusClearances.setText("✗ Clearances Checked: Pending verification");
            tvApprovalStatusClearances.setTextColor(Color.parseColor("#C62828"));
        }

        if ("Completed".equalsIgnoreCase(data.getPreOpStatus())) {
            tvApprovalStatusPreop.setText("✓ Pre-Op Readiness: Completed");
            tvApprovalStatusPreop.setTextColor(Color.parseColor("#2E7D32"));
        } else {
            tvApprovalStatusPreop.setText("✗ Pre-Op Readiness: Pending check items");
            tvApprovalStatusPreop.setTextColor(Color.parseColor("#C62828"));
        }
    }
}