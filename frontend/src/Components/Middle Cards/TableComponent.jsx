
import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const TableComponent = ({ data = [], loading }) => {
  const { translate } = useLanguage();

  const total = data.reduce((sum, row) => sum + row.count, 0);

  if (loading) return <p>{translate("Loading...")}</p>;

  return (
    <div className="TableBox">
      <p className="total-suspended">
        {translate(`Total Application Aging: ${total}`)}
      </p>
      <table>
        <thead>
          <tr>
            <th>{translate("Aging Report")}</th>
            <th>{translate("Count")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{translate(row.dueIn)}</td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
