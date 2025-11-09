import React, { useState, useEffect } from "react";
import "./App.css";

// دالة التخزين
const storage = {
  getBatches: () => {
    const batches = localStorage.getItem("potato_batches");
    return batches ? JSON.parse(batches) : [];
  },
  saveBatches: (batches) => {
    localStorage.setItem("potato_batches", JSON.stringify(batches));
  },
  addBatch: (batch) => {
    const batches = storage.getBatches();
    const newBatch = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...batch,
    };
    batches.push(newBatch);
    storage.saveBatches(batches);
    return newBatch;
  },
  updateBatch: (id, updatedBatch) => {
    const batches = storage.getBatches();
    const index = batches.findIndex((batch) => batch.id === id);
    if (index !== -1) {
      batches[index] = {
        ...batches[index],
        ...updatedBatch,
        updatedAt: new Date().toISOString(),
      };
      storage.saveBatches(batches);
      return batches[index];
    }
    return null;
  },
  deleteBatch: (id) => {
    const batches = storage.getBatches();
    const filteredBatches = batches.filter((batch) => batch.id !== id);
    storage.saveBatches(filteredBatches);
  },
  searchBatches: (query) => {
    const batches = storage.getBatches();
    if (!query) return batches;
    return batches.filter(
      (batch) =>
        batch.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        batch.supplier.toLowerCase().includes(query.toLowerCase())
    );
  },
};

// مكون معايير الجودة
const QualityMetrics = ({ formData, onChange }) => {
  const metrics = [
    {
      id: "dryMatter",
      name: "المادة الجافة (الصلابة)",
      unit: "%",
      preferred: "> 19%",
    },
    { id: "sugar", name: "السكر", unit: "ملغ/ديسيليتر", allowed: "≤ 10" },
    {
      id: "fryDefects",
      name: "عيوب الشريحة بعد القلي",
      unit: "%",
      allowed: "< 15%",
    },
    { id: "soil", name: "الاتربة", unit: "%" },
    { id: "greening", name: "الاخضرار", unit: "%" },
    { id: "disease", name: "الاصابات المرضية", unit: "%" },
    { id: "peeling", name: "التقشير", unit: "%" },
    { id: "mechanical", name: "الاصابات الميكانيكية", unit: "%" },
    { id: "wilting", name: "الذبول", unit: "%" },
    { id: "sizeDefects", name: "عيوب الاحجام", unit: "%" },
  ];

  const calculateTotalDefects = () => {
    const defects = [
      "soil",
      "greening",
      "disease",
      "peeling",
      "mechanical",
      "wilting",
      "sizeDefects",
    ];
    return defects.reduce(
      (total, defect) => total + (parseFloat(formData[defect]) || 0),
      0
    );
  };

  const calculatePriceDeduction = () => {
    const totalDefects = calculateTotalDefects();
    return Math.min(totalDefects, 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="form-title">معايير فحص الجودة</h3>

      <div className="quality-grid">
        {metrics.map((metric) => (
          <div key={metric.id} className="quality-item">
            <div className="quality-header">
              <div className="quality-name">{metric.name}</div>
              <div className="quality-badges">
                {metric.preferred && (
                  <span className="badge badge-green">{metric.preferred}</span>
                )}
                {metric.allowed && (
                  <span className="badge badge-blue">{metric.allowed}</span>
                )}
              </div>
            </div>
            <div className="quality-input-group">
              <span className="quality-unit">{metric.unit}</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData[metric.id] || ""}
                onChange={(e) => onChange(metric.id, e.target.value)}
                className="form-input quality-input"
                placeholder="0.0"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="summary-box">
        <div className="summary-title">ملخص الخصومات</div>
        <div className="summary-grid">
          <div>إجمالي نسبة العيوب:</div>
          <div className="summary-value">
            {calculateTotalDefects().toFixed(1)}%
          </div>
          <div>نسبة الخصم من السعر:</div>
          <div className="summary-deduction">
            {calculatePriceDeduction().toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون نموذج الدفعة
const BatchForm = ({ batchToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    batchNumber: "",
    supplier: "",
    arrivalDate: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
    dryMatter: "",
    sugar: "",
    fryDefects: "",
    soil: "",
    greening: "",
    disease: "",
    peeling: "",
    mechanical: "",
    wilting: "",
    sizeDefects: "",
  });

  React.useEffect(() => {
    if (batchToEdit) {
      setFormData(batchToEdit);
    }
  }, [batchToEdit]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditMode = !!batchToEdit;

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          {isEditMode ? "تعديل دفعة" : "إضافة دفعة جديدة"}
        </h2>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            إلغاء
          </button>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">رقم الدفعة *</label>
          <input
            type="text"
            required
            value={formData.batchNumber}
            onChange={(e) => handleChange("batchNumber", e.target.value)}
            className="form-input"
            placeholder="مثال: BATCH-001"
          />
        </div>

        <div className="form-group">
          <label className="form-label">المورد *</label>
          <input
            type="text"
            required
            value={formData.supplier}
            onChange={(e) => handleChange("supplier", e.target.value)}
            className="form-input"
            placeholder="اسم المورد"
          />
        </div>

        <div className="form-group">
          <label className="form-label">تاريخ الاستلام *</label>
          <input
            type="date"
            required
            value={formData.arrivalDate}
            onChange={(e) => handleChange("arrivalDate", e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">الكمية (طن) *</label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="form-input"
            placeholder="0.0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">السعر (للطن) *</label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="form-input"
            placeholder="0.0"
          />
        </div>
      </div>

      <QualityMetrics formData={formData} onChange={handleChange} />

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          إلغاء
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditMode ? "تحديث الدفعة" : "إضافة الدفعة"}
        </button>
      </div>
    </form>
  );
};

// مكون قائمة الدفعات
const BatchList = ({
  batches,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getQualityStatus = (batch) => {
    const totalDefects = [
      "soil",
      "greening",
      "disease",
      "peeling",
      "mechanical",
      "wilting",
      "sizeDefects",
    ].reduce((total, defect) => total + (parseFloat(batch[defect]) || 0), 0);

    if (totalDefects > 20) return { text: "رديء", class: "status-bad" };
    if (totalDefects > 10) return { text: "متوسط", class: "status-medium" };
    return { text: "جيد", class: "status-good" };
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">قائمة الدفعات ({batches.length})</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث برقم الدفعة أو المورد..."
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>رقم الدفعة</th>
              <th>المورد</th>
              <th>التاريخ</th>
              <th>الكمية</th>
              <th>الجودة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const status = getQualityStatus(batch);
              return (
                <tr key={batch.id}>
                  <td>{batch.batchNumber}</td>
                  <td>{batch.supplier}</td>
                  <td>{formatDate(batch.arrivalDate)}</td>
                  <td>{batch.quantity} طن</td>
                  <td>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => onEdit(batch)}
                        className="action-btn action-edit"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => onDelete(batch.id)}
                        className="action-btn action-delete"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {batches.length === 0 && (
          <div className="empty-state">
            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد دفعات مسجلة"}
          </div>
        )}
      </div>
    </div>
  );
};

// المكون الرئيسي
function App() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    setBatches(storage.getBatches());
  }, []);

  React.useEffect(() => {
    if (searchQuery) {
      setBatches(storage.searchBatches(searchQuery));
    } else {
      setBatches(storage.getBatches());
    }
  }, [searchQuery]);

  const handleAddBatch = () => {
    setEditingBatch(null);
    setShowForm(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowForm(true);
  };

  const handleSaveBatch = (batchData) => {
    if (editingBatch) {
      storage.updateBatch(editingBatch.id, batchData);
    } else {
      storage.addBatch(batchData);
    }
    setBatches(storage.getBatches());
    setShowForm(false);
    setEditingBatch(null);
  };

  const handleDeleteBatch = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      storage.deleteBatch(id);
      setBatches(storage.getBatches());
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBatch(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🥔</div>
              <div className="logo-text">
                <h1>نظام جودة البطاطا</h1>
                <p>إدارة فحص وتقييم جودة دفعات البطاطا</p>
              </div>
            </div>
            <button onClick={handleAddBatch} className="btn btn-primary">
              + إضافة دفعة
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {showForm ? (
            <BatchForm
              batchToEdit={editingBatch}
              onSave={handleSaveBatch}
              onCancel={handleCancel}
            />
          ) : (
            <BatchList
              batches={batches}
              onEdit={handleEditBatch}
              onDelete={handleDeleteBatch}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
