package com.saveetha.clearpathai;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class DocumentBundleFragment extends Fragment implements View.OnClickListener {

    private LinearLayout cardPrescription, cardLabReport, cardScanRadiology;
    private LinearLayout cardBillInsurance, cardPatientId, cardOtherDoc;

    public DocumentBundleFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_document_bundle, container, false);

        // Map selection container blocks
        cardPrescription = view.findViewById(R.id.cardPrescription);
        cardLabReport = view.findViewById(R.id.cardLabReport);
        cardScanRadiology = view.findViewById(R.id.cardScanRadiology);
        cardBillInsurance = view.findViewById(R.id.cardBillInsurance);
        cardPatientId = view.findViewById(R.id.cardPatientId);
        cardOtherDoc = view.findViewById(R.id.cardOtherDoc);

        // Bind standard click callbacks
        cardPrescription.setOnClickListener(this);
        cardLabReport.setOnClickListener(this);
        cardScanRadiology.setOnClickListener(this);
        cardBillInsurance.setOnClickListener(this);
        cardPatientId.setOnClickListener(this);
        cardOtherDoc.setOnClickListener(this);

        return view;
    }

    @Override
    public void onClick(View v) {
        String selectedType = "";
        int viewId = v.getId();

        if (viewId == R.id.cardPrescription) {
            selectedType = "Prescription";
        } else if (viewId == R.id.cardLabReport) {
            selectedType = "Lab Report";
        } else if (viewId == R.id.cardScanRadiology) {
            selectedType = "Scan / X-Ray / MRI";
        } else if (viewId == R.id.cardBillInsurance) {
            selectedType = "Bill / Insurance";
        } else if (viewId == R.id.cardPatientId) {
            selectedType = "Patient ID";
        } else if (viewId == R.id.cardOtherDoc) {
            selectedType = "Other Document";
        }

        // Display a Toast message confirming selection
        Toast.makeText(getContext(), "Selected: " + selectedType, Toast.LENGTH_SHORT).show();
        // REPLACE YOUR TOAST LINE WITH THIS CODE BLOCK TRANSACTION
        SelectBundlePatientFragment nextStepFragment = SelectBundlePatientFragment.newInstance(selectedType);
        if (getParentFragmentManager() != null) {
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.frameLayout, nextStepFragment) // Use your main activity container tracking ID
                    .addToBackStack(null)
                    .commit();
        }

        // Pipeline note: Proceed to Step 2 (Patient verification fragment match screen transition) here.
    }
}