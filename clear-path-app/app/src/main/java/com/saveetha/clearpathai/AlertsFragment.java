package com.saveetha.clearpathai;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class AlertsFragment extends Fragment {

    public AlertsFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the structured dashboard design file inside the layout manager context loop
        return inflater.inflate(R.layout.fragment_alerts, container, false);
    }
}