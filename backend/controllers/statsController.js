const statsService = require('../services/statsService');
const catchAsync = require('../utils/catchAsync');

const getAdminDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await statsService.getAdminDashboardStatsService(
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getManagerDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await statsService.getManagerDashboardStatsService();
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getCompanyCommonInterest = catchAsync(async (req, res, next) => {
  const result = await statsService.getCommonInterestService(
    req.dbUser,
    req.query
  );
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getTopRewardRequests = catchAsync(async (req, res, next) => {
  const topRequests = await statsService.getTopRewardRequestsService(
    req.dbUser,
    req.query
  );
  res.status(200).json({
    status: 'success',
    results: topRequests.length,
    data: { requests: topRequests },
  });
});

module.exports = {
  getAdminDashboardStats,
  getManagerDashboardStats,
  getCompanyCommonInterest,
  getTopRewardRequests,
};
