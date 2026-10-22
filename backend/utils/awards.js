/**
 * Award tier resolution shared by submission, evaluation and certificate routes.
 *
 * A team always earns a certificate. The *tier* decides how it is highlighted:
 * strong submissions are upgraded to an Alternate Prize or a Special Mention,
 * everything else falls back to a Participation Award.
 */

// score is the evaluation total out of 100 (4 x 20pt criteria + 2 x 10pt criteria).
const TIERS = [
  {
    type: 'winner',
    min: 85,
    label: 'Grand Prize Winner',
    headline: 'Winner',
    blurb: 'for outstanding innovation, technical excellence and real-world impact',
  },
  {
    type: 'runner_up',
    min: 70,
    label: 'First Runner-Up',
    headline: 'First Runner-Up',
    blurb: 'for a highly polished solution that impressed the judging panel',
  },
  {
    type: 'second_runner_up',
    min: 60,
    label: 'Second Runner-Up',
    headline: 'Second Runner-Up',
    blurb: 'for strong execution and a clear, well-scoped product idea',
  },
  {
    type: 'alternate',
    min: 50,
    label: 'Alternate Prize',
    headline: 'Alternate Prize',
    blurb: 'for an excellent project that stood out among the top entries',
  },
  {
    type: 'special_mention',
    min: 40,
    label: 'Special Mention',
    headline: 'Special Mention',
    blurb: 'for a promising solution recognised by the judges for its originality',
  },
  {
    type: 'participation',
    min: 0,
    label: 'Participation Award',
    headline: 'Participant',
    blurb: 'for building, deploying and presenting a project at HackMatch AI',
  },
];

const TYPES = TIERS.map((t) => t.type);

const DEFAULT_TIER = TIERS[TIERS.length - 1];

const getTier = (type) => TIERS.find((t) => t.type === type) || DEFAULT_TIER;

/**
 * Map a 0-100 score onto an award tier.
 * @param {number} score
 * @returns {{type:string,label:string,headline:string,blurb:string,min:number}}
 */
const tierForScore = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return DEFAULT_TIER;
  const clamped = Math.max(0, Math.min(100, n));
  return TIERS.find((t) => clamped >= t.min) || DEFAULT_TIER;
};

/**
 * Merge tier + score onto a certificate document and persist it.
 * Safe to call repeatedly: an existing certificate is upgraded in place rather
 * than duplicated, and a participation certificate is never downgraded by a
 * later, weaker tier.
 */
const applyAwardToCertificate = async (Certificate, { certId, type, score, awardTitle, rank }) => {
  if (!certId) return null;
  const tier = getTier(type);
  const update = {
    type: tier.type,
    awardTitle: awardTitle || tier.label,
    awardHeadline: tier.headline,
    awardBlurb: tier.blurb,
  };
  if (Number.isFinite(Number(score))) update.awardScore = Math.max(0, Math.min(100, Number(score)));
  if (Number.isFinite(Number(rank))) update.rank = Number(rank);

  return Certificate.findByIdAndUpdate(certId, { $set: update }, { new: true });
};

/**
 * Find the certificate issued for a submission and upgrade it to the resolved
 * tier. Returns the updated certificate, or null when the member never got one.
 */
const upgradeCertificateForSubmission = async (Certificate, { userId, submissionId, type, score, rank }) => {
  if (!userId || !submissionId) return null;
  const cert = await Certificate.findOne({ user: userId, submission: submissionId });
  if (!cert) return null;
  return applyAwardToCertificate(Certificate, { certId: cert._id, type, score, rank });
};

module.exports = {
  TIERS,
  TYPES,
  DEFAULT_TIER,
  getTier,
  tierForScore,
  applyAwardToCertificate,
  upgradeCertificateForSubmission,
};
