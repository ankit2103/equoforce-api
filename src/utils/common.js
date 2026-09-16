function successRes(res, status, data) {
  return res.status(status).json({ success: true, ...data });
}

function errorRes(res, status, message, extra) {
  return res.status(status).json({ success: false, message, ...(extra || {}) });
}

function parseList(value) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

module.exports = { successRes, errorRes, parseList };