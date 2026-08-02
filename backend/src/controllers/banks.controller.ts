import { Request, Response } from "express";
import { bankOffers } from "../data/banks";

export const getAllBanks = async (req: Request, res: Response) => {
  try {
    const banks = Array.from(new Set(bankOffers.map((offer) => offer.bank)));
    res.json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get banks" });
  }
};

export const getAllOffers = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: bankOffers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get offers" });
  }
};

export const getBankOffers = async (req: Request, res: Response) => {
  try {
    const { bankName } = req.params;
    const offers = bankOffers.filter((offer) => offer.bank === bankName);
    res.json({ success: true, data: offers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to get bank offers" });
  }
};
