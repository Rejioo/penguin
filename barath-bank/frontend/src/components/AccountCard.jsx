export default function AccountCard({ account }) {
  return (
    <div className="bank-card">
      <div className="bank-card-top">
        <div className="bank-name">SmartBank</div>
        <div className="card-type">
          {account.type || "SAVINGS"}
        </div>
      </div>

      <div className="bank-card-number">
        {account.account_number
          ?.replace(/(.{4})/g, "$1 ")
          .trim()}
      </div>

      <div className="bank-card-footer">
        <div>
          <div className="card-label">Balance</div>
          <div className="card-balance">
            ₹ {Number(account.balance).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="card-chip" />
      </div>
    </div>
  );
}
