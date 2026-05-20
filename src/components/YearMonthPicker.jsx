import { useEffect, useRef, useState } from "react";

export default function YearMonthPicker({
  year,
  month,
  onChangeYear,
  onChangeMonth,
  startYear,
  yearCount = 6,
}) {
  const [openType, setOpenType] = useState(null);
  const pickerRef = useRef(null);

  const years = Array.from({ length: yearCount }, (_, index) => startYear + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpenType(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectYear = (selectedYear) => {
    onChangeYear(selectedYear);
    setOpenType(null);
  };

  const handleSelectMonth = (selectedMonth) => {
    onChangeMonth(selectedMonth);
    setOpenType(null);
  };

  return (
    <div className="ym-picker" ref={pickerRef}>
      <div className="ym-select-wrap">
        <button
          type="button"
          className={`ym-select-button ${openType === "year" ? "active" : ""}`}
          onClick={() => setOpenType(openType === "year" ? null : "year")}
        >
          {year}년
          <span>▾</span>
        </button>

        {openType === "year" && (
          <div className="ym-dropdown">
            {years.map((item) => (
              <button
                key={item}
                type="button"
                className={item === year ? "selected" : ""}
                onClick={() => handleSelectYear(item)}
              >
                {item}년
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ym-select-wrap">
        <button
          type="button"
          className={`ym-select-button ${openType === "month" ? "active" : ""}`}
          onClick={() => setOpenType(openType === "month" ? null : "month")}
        >
          {month}월
          <span>▾</span>
        </button>

        {openType === "month" && (
          <div className="ym-dropdown month">
            {months.map((item) => (
              <button
                key={item}
                type="button"
                className={item === month ? "selected" : ""}
                onClick={() => handleSelectMonth(item)}
              >
                {item}월
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}