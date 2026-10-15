import { useEffect, useMemo, useState } from "react";
import { getOrders } from "../lib/api";
import type { Order } from "../types";

const STATUS = [
  { key: "PENDING", label: "En attente" },
  { key: "CONFIRMED", label: "Confirmées" },
  { key: "PROCESSING", label: "Préparation" },
  { key: "SHIPPED", label: "Expédiées" },
  { key: "DELIVERED", label: "Livrées" },
  { key: "CANCELLED", label: "Annulées" }
];

export default function Statistics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((error) => {
        console.error("Erreur statistiques :", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const d = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const delivered = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === "DELIVERED"
    ).length;

    const cancelled = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === "CANCELLED"
    ).length;

    const average = orders.length
      ? revenue / orders.length
      : 0;

    const counts = orders.reduce<Record<string, number>>(
      (acc, order) => {
        const status = String(order.status).toUpperCase();

        acc[status] = (acc[status] || 0) + 1;

        return acc;
      },
      {}
    );

    const revenueByStatus = orders.reduce<Record<string, number>>(
      (acc, order) => {
        const status = String(order.status).toUpperCase();

        acc[status] =
          (acc[status] || 0) + Number(order.total || 0);

        return acc;
      },
      {}
    );

    return {
      revenue,
      delivered,
      cancelled,
      average,
      counts,
      revenueByStatus
    };
  }, [orders]);

  const maxOrders = Math.max(
    1,
    ...STATUS.map((status) => d.counts[status.key] || 0)
  );

  /*
   * Donut
   */
  const totalForDonut = Math.max(1, orders.length);

  let currentOffset = 0;

  const donutSegments = STATUS.map((status) => {
    const value = d.counts[status.key] || 0;

    const percentage =
      (value / totalForDonut) * 100;

    const segment = {
      ...status,
      value,
      percentage,
      offset: currentOffset
    };

    currentOffset += percentage;

    return segment;
  });

  /*
   * Statistiques par statut
   */
  const statusColors: Record<string, string> = {
    PENDING: "#b08d57",
    CONFIRMED: "#6c8a6b",
    PROCESSING: "#4b8f63",
    SHIPPED: "#6687a8",
    DELIVERED: "#4f7d61",
    CANCELLED: "#a95d5d"
  };

  if (loading) {
    return (
      <div className="page">
        <section className="panel statistics-loading">
          Chargement des statistiques...
        </section>
      </div>
    );
  }

  return (
    <div className="page statistics-page">

      {/* HEADER */}
      <div className="statistics-header">
        <div>
          <h1 className="eyebrow">
            Analyse & performance
          </h1>
        </div>
      </div>

      {/* PERFORMANCE FINANCIÈRE */}
      <section className="financial-overview">
        <div className="financial-main">
          <div>
            <span className="eyebrow">PERFORMANCE FINANCIÈRE</span>
            <h2>Chiffre d’affaires</h2>
            <p>Vue globale des ventes enregistrées dans l’administration.</p>
          </div>
          <strong>{d.revenue.toFixed(2)} <small>TND</small></strong>
        </div>

        <div className="financial-kpis">
          <div>
            <span>Panier moyen</span>
            <strong>{d.average.toFixed(2)} TND</strong>
          </div>
          <div>
            <span>CA livré</span>
            <strong>{(d.revenueByStatus.DELIVERED || 0).toFixed(2)} TND</strong>
          </div>
          <div>
            <span>CA annulé</span>
            <strong>{(d.revenueByStatus.CANCELLED || 0).toFixed(2)} TND</strong>
          </div>
        </div>
      </section>

      {/* GRAPHES */}
      <div className="statistics-charts">

        {/* GRAPHE BARRES */}
        <section className="panel chart-panel">

          <div className="panel-head">
            <div>
              <span className="eyebrow">
                COMMANDES
              </span>
            </div>
          </div>

          <div className="vertical-chart">

            {STATUS.map((status) => {
              const value =
                d.counts[status.key] || 0;

              const height =
                (value / maxOrders) * 100;

              return (
                <div
                  className="chart-column"
                  key={status.key}
                >

                  <div className="chart-value">
                    {value}
                  </div>

                  <div className="chart-bar-area">

                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(
                          value > 0 ? height : 2,
                          2
                        )}%`,
                        background:
                          statusColors[status.key]
                      }}
                    />

                  </div>

                  <span>
                    {status.label}
                  </span>

                </div>
              );
            })}

          </div>

        </section>

        {/* DONUT */}
        <section className="panel chart-panel donut-panel">

          <div className="panel-head">
            <div>
              <span className="eyebrow">
                RÉPARTITION
              </span>
            </div>
          </div>

          <div className="donut-content">

            <div
              className="donut"
              style={{
                background: `conic-gradient(
                  ${STATUS.map((status) => {
                    const start =
                      donutSegments.find(
                        (segment) =>
                          segment.key === status.key
                      )?.offset || 0;

                    const end =
                      start +
                      (d.counts[status.key] || 0) /
                        totalForDonut *
                        100;

                    return `${statusColors[status.key]} ${start}% ${end}%`;
                  }).join(", ")}
                )`
              }}
            >
              <div className="donut-center">
                <strong>
                  {orders.length}
                </strong>

                <span>
                  commandes
                </span>
              </div>
            </div>

            <div className="donut-legend">

              {STATUS.map((status) => {
                const value =
                  d.counts[status.key] || 0;

                const percentage =
                  orders.length
                    ? Math.round(
                        (value / orders.length) * 100
                      )
                    : 0;

                return (
                  <div
                    className="legend-item"
                    key={status.key}
                  >
                    <div className="legend-left">

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            statusColors[status.key]
                        }}
                      />

                      <span>
                        {status.label}
                      </span>

                    </div>

                    <strong>
                      {percentage}%
                    </strong>
                  </div>
                );
              })}

            </div>

          </div>

        </section>

      </div>

      {/* CA PAR STATUT */}
      <section className="panel revenue-panel">

        <div className="panel-head">

          <div>
            <span className="eyebrow">
              PERFORMANCE FINANCIÈRE
            </span>
          </div>

          <strong className="revenue-total">
            {d.revenue.toFixed(2)} TND
          </strong>

        </div>

        <div className="revenue-chart">

          {STATUS.map((status) => {

            const revenue =
              d.revenueByStatus[status.key] || 0;

            const width =
              d.revenue > 0
                ? (revenue / d.revenue) * 100
                : 0;

            return (
              <div
                className="revenue-row"
                key={status.key}
              >

                <div className="revenue-label">
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        statusColors[status.key]
                    }}
                  />

                  <span>
                    {status.label}
                  </span>
                </div>

                <div className="revenue-track">

                  <div
                    className="revenue-bar"
                    style={{
                      width: `${width}%`,
                      background:
                        statusColors[status.key]
                    }}
                  />

                </div>

                <strong>
                  {revenue.toFixed(2)} TND
                </strong>

              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}