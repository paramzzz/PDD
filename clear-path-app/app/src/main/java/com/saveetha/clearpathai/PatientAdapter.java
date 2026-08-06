package com.saveetha.clearpathai;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.saveetha.clearpathai.PatientDetailFetchResponse;
import java.util.List;

public class PatientAdapter extends RecyclerView.Adapter<PatientAdapter.PatientViewHolder> {

    private List<PatientDetailFetchResponse> dataList;
    private OnItemClickListener listener;

    // Click interface to forward events to the parent fragment
    public interface OnItemClickListener {
        void onItemClick(PatientDetailFetchResponse patient);
    }

    public PatientAdapter(List<PatientDetailFetchResponse> dataList) {
        this.dataList = dataList;
    }

    // Setter method to attach the click listener from your fragment
    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void updateList(List<PatientDetailFetchResponse> newList) {
        this.dataList = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public PatientViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_patient_card, parent, false);
        return new PatientViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull PatientViewHolder holder, int position) {
        PatientDetailFetchResponse p = dataList.get(position);

        holder.tvPatientName.setText(p.getFullName());
        holder.tvPatientMeta.setText(p.getAge() + " · " + p.getGender() + " · " + p.getTimeElapsed());
        holder.tvComplaintSnippet.setText(p.getChiefComplaint());
        holder.tvBpValue.setText(p.getBp());
        holder.tvSpo2Value.setText("SpO₂ " + p.getSpo2());
        holder.tvRiskTag.setText(p.getInitialRisk().toUpperCase());
        holder.tvAvatar.setText(p.getFullName().substring(0,1));

        // Send card data models back to fragment level on item click
        holder.itemView.setOnClickListener(v -> {
            if (listener != null && position != RecyclerView.NO_POSITION) {
                listener.onItemClick(dataList.get(position));
            }
        });
    }

    @Override
    public int getItemCount() {
        return dataList.size();
    }

    static class PatientViewHolder extends RecyclerView.ViewHolder {
        TextView tvAvatar, tvPatientName, tvRiskTag, tvPatientMeta, tvComplaintSnippet, tvBpValue, tvSpo2Value;

        public PatientViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAvatar = itemView.findViewById(R.id.tvAvatar);
            tvPatientName = itemView.findViewById(R.id.tvPatientName);
            tvRiskTag = itemView.findViewById(R.id.tvRiskTag);
            tvPatientMeta = itemView.findViewById(R.id.tvPatientMeta);
            tvComplaintSnippet = itemView.findViewById(R.id.tvComplaintSnippet);
            tvBpValue = itemView.findViewById(R.id.tvBpValue);
            tvSpo2Value = itemView.findViewById(R.id.tvSpo2Value);
        }
    }
}