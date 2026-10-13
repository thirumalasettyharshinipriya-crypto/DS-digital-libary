import os
import json

def create_simple_pdf(filename, title, author, mentor, abstract, content_sections):
    # Minimal valid PDF 1.4 syntax
    lines = [
        f"Project Technical Report: {title}",
        f"Author: {author}",
        f"Faculty Supervisor: {mentor}",
        f"Academic Session: 2026-2027",
        "",
        "ABSTRACT & EXECUTIVE SUMMARY:",
        abstract,
        "",
        "METHODOLOGY & BENCHMARK RESULTS:"
    ]
    for header, text in content_sections:
        lines.append(f"[{header}]")
        lines.append(text)
        lines.append("")

    # Format into PDF stream
    stream_content = "BT\n/F1 14 Tf\n50 750 Td\n"
    stream_content += f"({title[:45]}) Tj\n"
    stream_content += "/F1 10 Tf\n0 -20 Td\n"
    stream_content += f"(Lead Author: {author[:50]}) Tj\n"
    stream_content += "0 -15 Td\n"
    stream_content += f"(Faculty Guide: {mentor[:50]}) Tj\n"
    stream_content += "0 -15 Td\n"
    stream_content += "(Institutional Department: Department of Data Science) Tj\n"
    stream_content += "0 -25 Td\n"
    stream_content += "/F1 11 Tf\n"
    stream_content += "(1. PROJECT OVERVIEW & SCOPE) Tj\n"
    stream_content += "/F1 9 Tf\n0 -15 Td\n"
    # wrap abstract into 80 chars
    words = abstract.split()
    line_buf = ""
    for w in words:
        if len(line_buf) + len(w) + 1 > 75:
            stream_content += f"({line_buf.replace('(', '[').replace(')', ']')}) Tj\n0 -12 Td\n"
            line_buf = w
        else:
            line_buf = f"{line_buf} {w}".strip()
    if line_buf:
        stream_content += f"({line_buf.replace('(', '[').replace(')', ']')}) Tj\n0 -20 Td\n"

    for h, txt in content_sections:
        stream_content += f"/F1 11 Tf\n({h.replace('(', '[').replace(')', ']')}) Tj\n/F1 9 Tf\n0 -14 Td\n"
        wds = txt.split()
        l_buf = ""
        for w in wds:
            if len(l_buf) + len(w) + 1 > 75:
                stream_content += f"({l_buf.replace('(', '[').replace(')', ']')}) Tj\n0 -12 Td\n"
                l_buf = w
            else:
                l_buf = f"{l_buf} {w}".strip()
        if l_buf:
            stream_content += f"({l_buf.replace('(', '[').replace(')', ']')}) Tj\n0 -18 Td\n"

    stream_content += "ET\n"
    stream_len = len(stream_content)

    pdf = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{stream_content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF
"""
    with open(filename, "w", encoding="latin-1") as f:
        f.write(pdf)
    print(f"Generated PDF: {filename}")

os.makedirs("uploads", exist_ok=True)

# Generate reports for projects 1 to 5
create_simple_pdf(
    "uploads/ecg_arrhythmia_report.pdf",
    "Autonomous ECG Cardiac Arrhythmia Classifier",
    "T. Harshini Priya (Lead Research Author), K. Rahul",
    "Dr. K. V. Ramanathan, M.Tech, Ph.D.",
    "Comprehensive validation of deep residual 1D-CNN combined with Bidirectional LSTM units on the MIT-BIH Arrhythmia benchmark. Preprocessing included 0.5-40Hz Butterworth bandpass filtering, Pan-Tompkins QRS wave isolation, and data augmentation for ectopic complexes.",
    [
        ("2. EXPERIMENTAL BENCHMARKS", "Diagnostic accuracy achieved 98.4% across 109,492 cardiac cycles with 97.8% precision, 98.9% recall, and 98.3% F1-score across 5 distinct clinical categories."),
        ("3. DEPLOYMENT & VERIFICATION", "Inference latency was benchmarked at under 14ms per 10-second segment, suitable for real-time edge telemetry monitoring.")
    ]
)

create_simple_pdf(
    "uploads/traffic_gnn_report.pdf",
    "Intelligent Traffic Congestion Predictor using Graph Networks",
    "T. Harshini Priya, M. Sneha, R. Vikram",
    "Prof. P. N. Murthy, Ph.D.",
    "Metropolitan intersection flow prediction modeling metropolitan road segments as vertices in a Spatio-Temporal Graph Convolutional Network (ST-GCN) with GRU recurrent units for 30-minute predictive horizon.",
    [
        ("2. SPATIO-TEMPORAL ARCHITECTURE", "Evaluated on 86,400 sensor loop readings across major arterial corridors. Mean Absolute Error was reduced by 14.8% compared to historical ARIMA baselines."),
        ("3. SIMULATION OUTCOMES", "Model identified bottlenecks with 95.2% accuracy, predicting severe congestion events with 20-minute advance warning.")
    ]
)

create_simple_pdf(
    "uploads/customer_churn_report.pdf",
    "Multi-Modal Retail Customer Churn Prediction Engine",
    "T. Harshini Priya (Sole Researcher)",
    "Dr. K. V. Ramanathan, M.Tech, Ph.D.",
    "Enterprise subscriber retention analytics utilizing gradient-boosted decision trees (XGBoost) and SHAP explainability matrices on behavioral, support, and billing features.",
    [
        ("2. PERFORMANCE & FEATURE IMPORTANCE", "Achieved 94.6% ROC-AUC score. Contract type, support ticket frequency, and fiber optic connectivity were identified as primary drivers of attrition."),
        ("3. BUSINESS RECOMMENDATIONS", "Automated trigger thresholds enabled pro-active customer success interventions, lowering projected monthly churn by 23%.")
    ]
)

create_simple_pdf(
    "uploads/brain_mri_glioma_report.pdf",
    "3D Volumetric Brain MRI Glioma Segmentation",
    "T. Harshini Priya (Lead Researcher)",
    "Dr. K. V. Ramanathan, M.Tech, Ph.D.",
    "Volumetric segmentation of glioblastoma sub-regions using 3D U-Net deep neural network on multi-modal FLAIR and T1ce MR neuro-imaging scans.",
    [
        ("2. VOLUMETRIC SEGMENTATION METRICS", "Dice similarity coefficient of 91.2% for whole tumor and 88.5% for active enhancing tumor core across BraTS clinical cohorts."),
        ("3. CLINICAL RELEVANCE", "Provides automated volumetric measurements for radiation oncology planning and surgical resection guidance.")
    ]
)

create_simple_pdf(
    "uploads/biobert_ner_report.pdf",
    "Biomedical Named Entity Recognition with BioBERT",
    "T. Harshini Priya (Lead)",
    "Dr. K. V. Ramanathan, M.Tech, Ph.D.",
    "Fine-tuned BioBERT transformer model with conditional random fields (CRF) for automated extraction of genes, diseases, and chemical compounds from scientific literature.",
    [
        ("2. EXTRACTION METRICS", "Achieved 89.7% F1-score across NCBI-Disease and BC5CDR gold standard corpora with sub-20ms inference latency."),
        ("3. REAL-TIME API", "Integrated with FastAPI REST endpoints for real-time indexing of PubMed biomedical abstracts.")
    ]
)

# Update database.json with report_file_url for projects 1 to 5
with open("data/database.json", "r") as f:
    db = json.load(f)

for p in db.get("projects", []):
    if p["id"] == 1 and not p.get("report_file_url"):
        p["report_file_url"] = "/uploads/ecg_arrhythmia_report.pdf"
    elif p["id"] == 2 and not p.get("report_file_url"):
        p["report_file_url"] = "/uploads/traffic_gnn_report.pdf"
    elif p["id"] == 3 and not p.get("report_file_url"):
        p["report_file_url"] = "/uploads/customer_churn_report.pdf"
    elif p["id"] == 4 and not p.get("report_file_url"):
        p["report_file_url"] = "/uploads/brain_mri_glioma_report.pdf"
    elif p["id"] == 5 and not p.get("report_file_url"):
        p["report_file_url"] = "/uploads/biobert_ner_report.pdf"

with open("data/database.json", "w") as f:
    json.dump(db, f, indent=2)

print("Updated data/database.json successfully.")
