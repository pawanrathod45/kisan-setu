const Query = require("../models/Query");

const getEscalations = async (req, res) => {
  try {
    const escalations = await Query.find({
      escalationRequired: true,
      resolvedByOfficer: false,
    }).populate("farmerId");

    res.json(escalations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch escalations",
    });
  }
};

// 2️⃣ Resolve Escalated Query
const resolveEscalation = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerResponse, officerRemarks } = req.body;

    const query = await Query.findById(id);

    if (!query) {
      return res.status(404).json({
        message: "Query not found",
      });
    }

    query.officerResponse = officerResponse;
    query.officerRemarks = officerRemarks;
    query.resolvedByOfficer = true;
    query.resolvedAt = new Date();
    query.escalationRequired = false;

    await query.save();

    res.json({
      message: "Escalation resolved successfully",
      query,
    });
  } catch (error) {
    res.status(500).json({
      message: "Resolution failed",
    });
  }
};

module.exports = {
  getEscalations,
  resolveEscalation,
};
