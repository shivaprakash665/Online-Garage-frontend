import React from "react";

export default function VehicleList({ vehicles }) {
  return (
    <div>
      <h5 className="mb-3">Your Vehicle List</h5>

      <div className="row g-3">
        {vehicles.length === 0 && (
          <div className="col-12 text-muted text-center">
            <em>No vehicles found</em>
          </div>
        )}

        {vehicles.map((v) => (
          <div key={v._id} className="col-md-4 col-sm-6">
            <div className="card h-100 shadow-sm border-0">
              {v.imagePath ? (
                <img
                  src={`${
                    import.meta.env.VITE_API_BASE?.replace?.("/api/vehicles", "") ||
                    "https://online-garage-api-2.onrender.com"
                  }${v.imagePath}`}
                  className="card-img-top"
                  alt="vehicle"
                  style={{ height: 150, objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: 150, background: "#f5f5f5" }} />
              )}

              <div className="card-body">
                <h6 className="card-title">{v.registrationNumber}</h6>
                <p className="mb-1">
                  {v.make} - {v.model}
                </p>
                <p className="mb-0 text-muted small">
                  {v.fuelType} • {v.color}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
