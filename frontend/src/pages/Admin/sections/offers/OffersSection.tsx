// frontend/src/pages/Admin/sections/offers/OffersSection.tsx

import React, { useState } from "react";
import { AdminLayout } from "../../AdminLayout";
import { AdminOffer } from "../../types/admin.types";
import { useOffersData } from "./hooks/useOffersData";
import { BankTabs } from "./components/BankTabs";
import { ProgramGroup } from "./components/ProgramGroup";
import { OfferModal } from "./components/OfferModal";
import { OffersToolbar } from "./components/OffersToolbar";
import { OffersEmptyState } from "./components/OffersEmptyState";
import "./OffersSection.css";
import { getDisplayRate, getDisplaySubsidy, renderComplexesList } from "./utils/offerHelpers";
import adminApi from "../../../../services/adminApi";

export const OffersSection: React.FC = () => {
  const {
    offers,
    banks,
    programs,
    complexes,
    loading,
    selectedBankId,
    dynamicDataMap,
    setSelectedBankId,
    refresh,
  } = useOffersData();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getOffersByBankAndProgram = () => {
    const result: Record<string, Record<string, AdminOffer[]>> = {};
    const offersByBank: Record<string, AdminOffer[]> = {};
    
    for (const offer of offers) {
      if (!offersByBank[offer.bankId]) {
        offersByBank[offer.bankId] = [];
      }
      offersByBank[offer.bankId].push(offer);
    }

    for (const [bankId, bankOffers] of Object.entries(offersByBank)) {
      const byProgram: Record<string, AdminOffer[]> = {};
      for (const offer of bankOffers) {
        const programId = offer.programId;
        if (!byProgram[programId]) {
          byProgram[programId] = [];
        }
        byProgram[programId].push(offer);
      }
      result[bankId] = byProgram;
    }

    return result;
  };

  const getProgramLabel = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program?.label || programId;
  };

  const getProgramType = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program?.type || "unknown";
  };

  const openEditModal = (offer: AdminOffer) => {
    setEditingOffer(offer);
    setIsCreating(false);
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setIsCreating(true);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingOffer(null);
    setIsCreating(false);
  };

  const handleCopy = async (id: string) => {
    try {
      const copy = await adminApi.copyOffer(id);
      setOffers([...offers, copy]);
      alert("✅ Оффер скопирован");
    } catch (error) {
      console.error("Error copying offer:", error);
      alert("❌ Ошибка при копировании оффера");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить оффер?")) return;
    try {
      await adminApi.deleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
      alert("✅ Оффер удален");
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("❌ Ошибка при удалении оффера");
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("Полностью удалить оффер без возможности восстановления?")) return;
    try {
      await adminApi.hardDeleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
      alert("✅ Оффер полностью удален");
    } catch (error) {
      console.error("Error hard deleting offer:", error);
      alert("❌ Ошибка при удалении оффера");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const restored = await adminApi.restoreOffer(id);
      setOffers(offers.map((o) => (o.id === id ? restored : o)));
      alert("✅ Оффер восстановлен");
    } catch (error) {
      console.error("Error restoring offer:", error);
      alert("❌ Ошибка при восстановлении оффера");
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesBank = !selectedBankId || offer.bankId === selectedBankId;
    const matchesSearch =
      offer.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBankName(offer.bankId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBank && matchesSearch;
  });

  const getBankName = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    return bank?.name || bankId;
  };

  const groupedOffers = getOffersByBankAndProgram();

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="offers-section">
      <AdminLayout title="📄 Офферы (предложения банков)">
        <OffersToolbar
          onAdd={openCreateModal}
          onRefresh={refresh}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalCount={filteredOffers.length}
        />

        <BankTabs
          banks={banks}
          offers={offers}
          selectedBankId={selectedBankId}
          onSelect={setSelectedBankId}
        />

        {selectedBankId && groupedOffers[selectedBankId] ? (
          <div className="bank-offers">
            {Object.entries(groupedOffers[selectedBankId]).map(([programId, programOffers]) => {
              const programLabel = getProgramLabel(programId);
              const programType = getProgramType(programId);

              return (
                <ProgramGroup
                  key={programId}
                  programId={programId}
                  programLabel={programLabel}
                  programType={programType}
                  offers={programOffers}
                  dynamicDataMap={dynamicDataMap}
                  onEdit={openEditModal}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onHardDelete={handleHardDelete}
                  getDisplayRate={getDisplayRate}
                  getDisplaySubsidy={getDisplaySubsidy}
                  renderComplexesList={renderComplexesList}
                />
              );
            })}
          </div>
        ) : (
          <OffersEmptyState />
        )}

        <OfferModal
          isOpen={showEditModal}
          onClose={closeModal}
          isCreating={isCreating}
          editingOffer={editingOffer}
          banks={banks}
          programs={programs}
          complexes={complexes}
          onRefresh={refresh}
        />
      </AdminLayout>
    </div>
  );
};