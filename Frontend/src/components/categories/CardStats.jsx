const CardStats = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h3 className="text-gray-600">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
  
  export default CardStats;
  