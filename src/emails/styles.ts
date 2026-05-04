export const main = {
  backgroundColor: "#f8fafc",
  color: "#334155",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

export const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "32px",
};

export const heading = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 16px",
};

export const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

export const button = {
  backgroundColor: "#0891b2",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "700",
  padding: "12px 24px",
  textAlign: "center" as const,
  textDecoration: "none",
};

export const actionSection = {
  margin: "30px 0",
  textAlign: "center" as const,
};

export const linkText = {
  color: "#0891b2",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
  wordBreak: "break-all" as const,
};

export const detailBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "20px 0",
  padding: "20px",
};

export const detailLabel = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

export const detailValue = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "24px",
  margin: "0 0 12px",
};

export const finalDetailValue = {
  ...detailValue,
  marginBottom: 0,
};

export const successValue = {
  ...detailValue,
  color: "#16a34a",
};

export const hr = {
  borderColor: "#e2e8f0",
  margin: "30px 0",
};

export const footer = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
  textAlign: "center" as const,
};
