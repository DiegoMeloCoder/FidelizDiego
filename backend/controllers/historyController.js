const historyService = require('../services/historyService');
const catchAsync = require('../utils/catchAsync');

const getPointAssignmentHistory = catchAsync(async (req, res, next) => {
  const history = await historyService.getPointAssignmentHistoryService(
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history },
  });
});

const getManagerGlobalRedemptionHistory = catchAsync(async (req, res, next) => {
  const history =
    await historyService.getManagerGlobalRedemptionHistoryService();
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history },
  });
});

const getMyPointHistory = catchAsync(async (req, res, next) => {
  const history = await historyService.getMyPointHistoryService(req.dbUser.id);
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history },
  });
});

const getMyRedemptionHistory = catchAsync(async (req, res, next) => {
  const history = await historyService.getMyRedemptionHistoryService(
    req.dbUser.id
  );
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history },
  });
});

const getRanking = catchAsync(async (req, res, next) => {
  const ranking = await historyService.getRankingService(req.dbUser.companyId);
  res.status(200).json({
    status: 'success',
    results: ranking.length,
    data: { ranking },
  });
});

const getRedemptionHistoryAdmin = catchAsync(async (req, res, next) => {
  const history = await historyService.getRedemptionHistoryAdminService(
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history },
  });
});

module.exports = {
  getPointAssignmentHistory,
  getMyPointHistory,
  getMyRedemptionHistory,
  getRanking,
  getRedemptionHistoryAdmin,
  getManagerGlobalRedemptionHistory,
};
