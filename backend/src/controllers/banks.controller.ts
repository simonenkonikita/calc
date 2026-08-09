// backend/src/controllers/banks.controller.ts
import { Request, Response } from "express";
import { BankService } from "../services/BankService";
import { OfferService } from "../services/OfferService";

const bankService = new BankService();
const offerService = new OfferService();

export const getAllBanks = async (req: Request, res: Response) => {
  try {
    const banks = await bankService.getAllBanks();
    res.json({ success: true, data: banks });
  } catch (error) {
    console.error("Error getting banks:", error);
    res.status(500).json({ success: false, error: "Failed to get banks" });
  }
};

export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getAllOffers();
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error getting offers:", error);
    res.status(500).json({ success: false, error: "Failed to get offers" });
  }
};

export const getBankOffers = async (req: Request, res: Response) => {
  try {
    const { bankName } = req.params;
    // Находим банк по имени
    const banks = await bankService.getAllBanks();
    const bank = banks.find((b) => b.name === bankName);

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank not found",
      });
    }

    const offers = await offerService.getOffersByBank(bank.id);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error getting bank offers:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get bank offers" });
  }
};
