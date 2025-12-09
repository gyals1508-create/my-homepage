import { useState, useEffect, useMemo } from "react";
import "./MyOrderPage.css";
import Table from "../Common/Table";
import useData from "../Hook/useData";
import { useAuth } from "../../context/AuthContext";

const CONFIRMED_ORDERS_KEY = "mycart-confirmed-orders";
const ARCHIVED_ORDERS_KEY = "mycart-archived-orders";

const MyOrderHistoryPage = () => {
  const { user } = useAuth();

  const {
    data: orders,
    error,
    isLoading,
  } = useData(
    "/order",
    user?.token ? { headers: { "x-auth-token": user.token } } : {},
    [user?.token]
  );

  const [confirmedIds, setConfirmedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(CONFIRMED_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDates, setSelectedDates] = useState([]);

  const visible = useMemo(
    () =>
      (orders || []).filter(
        (o) => o._id && confirmedIds.includes(o._id)
      ),
    [orders, confirmedIds]
  );

  const getProductString = (order) =>
    order?.products
      ?.map((p) => {
        const t = p.product?.title || p.product?.name || "상품";
        const q = p.quantity ?? 1;
        return q > 1 ? `${t}(${q})` : t;
      })
      .join(", ") || "";

  const getTotalQuantity = (order) =>
    order?.products?.reduce((s, p) => s + (p.quantity ?? 1), 0) ?? 0;

  const getOrderDateInfo = (order) => {
    const raw =
      order?.createdAt ||
      order?.orderDate ||
      order?.paidAt ||
      order?.date ||
      order?.updatedAt;

    if (!raw) return { label: "기타 주문", sortValue: 0 };

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return { label: "기타 주문", sortValue: 0 };
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return {
      label: `${year}. ${month}. ${day} 주문`,
      sortValue: d.getTime(),
    };
  };

  const getStatusText = () => "물품확인";

  const groupedByDate = useMemo(() => {
    const map = new Map();

    visible.forEach((order) => {
      const { label, sortValue } = getOrderDateInfo(order);
      const existing = map.get(label);

      if (existing) {
        existing.orders.push(order);
      } else {
        map.set(label, { label, sortValue, orders: [order] });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [visible]);

  useEffect(() => {
    const labels = groupedByDate.map((g) => g.label);
    setSelectedDates((prev) => {
      const filtered = prev.filter((l) => labels.includes(l));
      return filtered.length ? filtered : labels;
    });
  }, [groupedByDate]);

  const isAllSelected =
    groupedByDate.length > 0 &&
    selectedDates.length === groupedByDate.length;

  const toggleDate = (label) => {
    setSelectedDates((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedDates([]);
    } else {
      setSelectedDates(groupedByDate.map((g) => g.label));
    }
  };

  const handleReset = () => {
    if (!selectedDates.length) return;

    const targetOrders = groupedByDate
      .filter((g) => selectedDates.includes(g.label))
      .flatMap((g) => g.orders);

    const idsToArchive = targetOrders
      .map((o) => o._id)
      .filter(Boolean);

    if (!idsToArchive.length) return;

    let archived = [];
    try {
      const saved = localStorage.getItem(ARCHIVED_ORDERS_KEY);
      archived = saved ? JSON.parse(saved) : [];
    } catch {
      archived = [];
    }

    const updatedArchived = Array.from(
      new Set([...archived, ...idsToArchive])
    );
    localStorage.setItem(
      ARCHIVED_ORDERS_KEY,
      JSON.stringify(updatedArchived)
    );

    const updatedConfirmed = confirmedIds.filter(
      (id) => !idsToArchive.includes(id)
    );
    setConfirmedIds(updatedConfirmed);
    localStorage.setItem(
      CONFIRMED_ORDERS_KEY,
      JSON.stringify(updatedConfirmed)
    );
  };

  if (isLoading)
    return (
      <section className="align_center myorder_page">
        <p>주문 정보를 불러오는 중입니다...</p>
      </section>
    );

  if (error)
    return (
      <section className="align_center myorder_page">
        <p>주문 정보를 불러올 수 없습니다.</p>
      </section>
    );

  return (
    <section className="align_center myorder_page">
      {visible.length > 0 ? (
        <div className="myorder_table_wrapper">
          {groupedByDate.length > 0 && (
            <div className="myorder_select_all">
              <label>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
                <span>전체 선택</span>
              </label>
            </div>
          )}

          {groupedByDate.map((group) => {
            const checked = selectedDates.includes(group.label);
            return (
              <div key={group.label} className="myorder_group">
                <h3 className="myorder_date_heading">
                  <label className="myorder_date_label">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDate(group.label)}
                    />
                    <span>{group.label}</span>
                  </label>
                </h3>
                <Table
                  headings={[
                    "내주문",
                    "상품들",
                    "총수량",
                    "결제금액",
                    "주문상태",
                  ]}
                >
                  <tbody>
                    {group.orders.map((order, index) => (
                      <tr key={order._id || index}>
                        <td>{index + 1}</td>
                        <td>{getProductString(order)}</td>
                        <td>{getTotalQuantity(order)}개</td>
                        <td>
                          {order.total?.toLocaleString("ko-KR")} 원
                        </td>
                        <td>{getStatusText()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}

          <button
            className="search_button order_reset_button"
            onClick={handleReset}
          >
            선택한 날짜 초기화
          </button>
        </div>
      ) : (
        <p className="myorder_empty">처리된 주문 내역이 없습니다.</p>
      )}
    </section>
  );
};

export default MyOrderHistoryPage;
