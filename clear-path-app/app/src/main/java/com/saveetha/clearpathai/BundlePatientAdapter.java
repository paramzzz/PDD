package com.saveetha.clearpathai;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class BundlePatientAdapter extends RecyclerView.Adapter<BundlePatientAdapter.ViewHolder> {

    private List<PatientDetailFetchResponse> patientList;
    private OnPatientClickListener listener;

    public interface OnPatientClickListener {
        void onPatientClick(PatientDetailFetchResponse patient);
    }

    public BundlePatientAdapter(List<PatientDetailFetchResponse> patientList, OnPatientClickListener listener) {
        this.patientList = patientList;
        this.listener = listener;
    }

    public void updateData(List<PatientDetailFetchResponse> newList) {
        this.patientList = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_bundle_patient, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        PatientDetailFetchResponse p = patientList.get(position);
        holder.tvName.setText(p.getFullName());
        holder.tvMeta.setText(p.getAge() + " · " + p.getGender() + " · " + p.getChiefComplaint());
        holder.tvAvatar.setText(p.getFullName().substring(0, 1).toUpperCase());

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onPatientClick(p);
        });
    }

    @Override
    public int getItemCount() {
        return patientList.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvAvatar, tvName, tvMeta;
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAvatar = itemView.findViewById(R.id.tvBundleAvatar);
            tvName = itemView.findViewById(R.id.tvBundlePatientName);
            tvMeta = itemView.findViewById(R.id.tvBundlePatientMeta);
        }
    }
}