import { colors } from "../../theme/colors";
import { AlertCircle, ShoppingCart, Clock } from "lucide-react";
import Badge from "./Badge";

export default function RefillAlert({ alert, onReorder }) {
  // Determine urgency level
  const getUrgencyLevel = () => {
    if (alert.current_stock === 0) return "critical";
    if (alert.current_stock < 10) return "high";
    if (alert.current_stock < 20) return "medium";
    return "low";
  };

  const getAlertColor = () => {
    const urgency = getUrgencyLevel();
    switch (urgency) {
      case "critical":
        return colors.red;
      case "high":
        return colors.orange;
      case "medium":
        return colors.yellow;
      default:
        return colors.blue;
    }
  };

  const getUrgencyText = () => {
    const urgency = getUrgencyLevel();
    switch (urgency) {
      case "critical":
        return "OUT OF STOCK";
      case "high":
        return "CRITICAL";
      case "medium":
        return "LOW STOCK";
      default:
        return "MONITOR";
    }
  };

  const getDaysText = () => {
    const days = alert.days_since_order || 0;
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div
      style={{
        background: colors.card,
        padding: "20px",
        borderRadius: "12px",
        border: `2px solid ${getAlertColor()}`,
        marginBottom: "20px",
        boxShadow: `0 0 20px ${getAlertColor()}20`,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <AlertCircle size={20} style={{ color: getAlertColor() }} />
            <h3 style={{ color: colors.textPrimary, margin: 0 }}>
              {alert.medicine_name}
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <p style={{ color: colors.textSecondary, fontSize: "12px", margin: "0 0 5px 0" }}>
                Current Stock
              </p>
              <p style={{ color: getAlertColor(), fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                {alert.current_stock} {alert.unit_type || "units"}
              </p>
            </div>

            <div>
              <p style={{ color: colors.textSecondary, fontSize: "12px", margin: "0 0 5px 0" }}>
                Price per Unit
              </p>
              <p style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                ₹{alert.price}
              </p>
            </div>

            <div>
              <p style={{ color: colors.textSecondary, fontSize: "12px", margin: "0 0 5px 0" }}>
                Last Ordered
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Clock size={14} style={{ color: colors.textSecondary }} />
                <p style={{ color: colors.textPrimary, fontSize: "14px", margin: 0 }}>
                  {getDaysText()}
                </p>
              </div>
            </div>
          </div>

          <p style={{ color: colors.textSecondary, fontSize: "14px", margin: "10px 0 0 0" }}>
            {alert.message || `${alert.medicine_name} is running low. Consider placing a refill order.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexDirection: "column", alignItems: "flex-end" }}>
          <Badge label={getUrgencyText()} color={getAlertColor()} />

          <button
            onClick={() => onReorder && onReorder(alert)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: colors.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              marginTop: "10px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = colors.green;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <ShoppingCart size={16} />
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
}
