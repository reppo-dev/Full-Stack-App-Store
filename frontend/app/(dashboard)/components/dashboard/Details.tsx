const Details = () => {
  return (
    <div className="rounded-lg border bg-card mt-10">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Deals Details</h2>
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 rounded-tl-lg text-sm font-semibold text-muted-foreground">
                Product Name
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Location
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Date - Time
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Piece
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Amount
              </th>
              <th className="p-3 rounded-tr-lg text-sm font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Apple Watch</td>
              <td className="p-3">6096 Marjolaine Landing</td>
              <td className="p-3">12.09.2026 - 12.53 PM</td>
              <td className="p-3">423</td>
              <td className="p-3">$34,295</td>
              <td className="p-3 font-semibold">$34,295</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
