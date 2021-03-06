SELECT
        DATE_FORMAT(RegisterDate, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2013-05-06', DATE_FORMAT(RegisterDate, '%Y-%m-%d')) as daysOut,
        COUNT(firstname) as count,
        (select count(*) from GRCombinedRegistrations04
       where  DATE_FORMAT(RegisterDate, '%Y-%m-%d') <= dateRegistered AND EventName <>  "DOL/OSHA Registration 2013 Safety Conference"
AND EventName <>  "VPPPA Speaker Registration 2013 Safety Conference") as total
FROM GRCombinedRegistrations04
WHERE EventName <>  "DOL/OSHA Registration 2013 Safety Conference"
AND EventName <>  "VPPPA Speaker Registration 2013 Safety Conference"
GROUP BY dateRegistered ASC


SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10) AND status > -1) as total
FROM conf_dtregister_user
WHERE (eventid = 9 OR eventid = 10) AND status > -1
GROUP BY dateRegistered ASC


SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10 OR eventid = 11)) as total
FROM conf_dtregister_user
WHERE eventid = 9 OR eventid = 10 OR eventid = 11
GROUP BY dateRegistered ASC

SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10 OR eventid = 11 OR eventid = 12) AND status > -1) as total
FROM conf_dtregister_user
WHERE (eventid = 9 OR eventid = 10 OR eventid = 11 OR eventid = 12) AND status > -1
GROUP BY dateRegistered ASC


SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 AND status = 1)) as total
FROM conf_dtregister_user
WHERE eventid = 9 AND status = 1
GROUP BY dateRegistered ASC


SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10  AND status = 1)) as total
FROM conf_dtregister_user
WHERE eventid = 9 OR eventid = 10 AND status = 1
GROUP BY dateRegistered ASC


SELECT
    COUNT(userId) as count,
    DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
    (select COUNT(userId) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 1 OR eventid = 2)) as total
FROM conf_dtregister_user
WHERE eventid = 1 OR eventid = 2
GROUP BY dateRegistered ASC

SELECT
    COUNT(userId) as count,
    DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
    (select COUNT(userId) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 1 )) as total
FROM conf_dtregister_user
WHERE eventid = 1
GROUP BY dateRegistered ASC

SELECT
    COUNT(userId) as count,
    DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
    (select COUNT(userId) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 2)) as total
FROM conf_dtregister_user
WHERE eventid = 2
GROUP BY dateRegistered ASC


SELECT
    COUNT(userId) as count,
    DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
    (select COUNT(userId) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10)) as total
FROM conf_dtregister_user
WHERE eventid = 9 OR eventid = 10
GROUP BY dateRegistered ASC

SELECT exhib_dtregister_user.* FROM exhib_dtregister_user
LEFT JOIN checkin.biller ON (exhib_dtregister_user.userId = checkin.biller.userId AND checkin.biller.eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f")
WHERE exhib_dtregister_user.eventId = 3 AND checkin.biller.userId IS NULL AND exhib_dtregister_user.status > -1


DELETE FROM biller_field_values WHERE user_id = 290 AND event_id = "84a8873a-92d5-11e3-a3e0-2b963df5580f";
DELETE FROM biller WHERE userId = 290 AND eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f";
DELETE FROM exhibitorAttendeeNumber WHERE userId = 290 AND eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f";
DELETE FROM exhibitorAttendees WHERE userId = 290 AND eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f";


SELECT
        exhib_dtregister_user.confirmNum,
        exhib_dtregister_user_field_values.value as company,
        (SELECT value FROM exhib_dtregister_user_field_values WHERE user_id = exhib_dtregister_user.userId AND exhib_dtregister_user_field_values.field_id = 10) as email
FROM exhib_dtregister_user
LEFT JOIN exhib_dtregister_user_field_values ON exhib_dtregister_user.userId = exhib_dtregister_user_field_values.user_id AND exhib_dtregister_user_field_values.field_id = 12
WHERE userId NOT IN
(
    SELECT  userId
    FROM  checkin.exhibitorAttendeeNumber
) AND eventId = 3 AND exhib_dtregister_user.status > -1;

DELETE FROM biller WHERE eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f";
DELETE FROM biller_field_Values WHERE event_id = "84a8873a-92d5-11e3-a3e0-2b963df5580f";

SELECT userId, eventId, local_eventId, type, register_date, payment_type, due_amount, pay_later_option, confirmNum, user_id, payment_verified, pay_later_paid, discount_code_id, billing_firstname, billing_lastname, billing_address, billing_city, billing_state, billing_zipcode, billing_email, due_payment, status, attend, paid_amount, transaction_id, memtot, cancel, tax_exemption, tax_exemption_code
FROM biller WHERE eventId = "84a8873a-92d5-11e3-a3e0-2b963df5580f"

SELECT
local_id, event_id, field_id, user_id, value
FROM biller_field_values WHERE event_id = "84a8873a-92d5-11e3-a3e0-2b963df5580f"


SELECT
      votes.electionid,
      votes.candidateid,
      electionOfficeCandidates.name,
      electionOfficeCandidates.company,
      count(votes.id) as candidateVote,
      totalVotes.totalVote,
      (count(votes.id)/totalVotes.totalVote) * 100 as percent
FROM votes
LEFT JOIN electionOfficeCandidates ON votes.candidateid = electionOfficeCandidates.id
LEFT JOIN (
  SELECT
      votes.electionid,
      count(votes.id) as totalVote
  FROM votes
  GROUP BY electionid
) as totalVotes ON votes.electionid = totalVotes.electionid
WHERE votes.electionid = ?
GROUP BY electionid, candidateid

SELECT
      votes.electionid,
      votes.candidateid,
      electionOfficeCandidates.name,
      electionOfficeCandidates.company,
      count(votes.id) as candidateVote,
      totalVotes.totalVote,
      (count(votes.id)/totalVotes.totalVote) * 100 as percent
FROM votes
LEFT JOIN electionOfficeCandidates ON votes.candidateid = electionOfficeCandidates.id
LEFT JOIN (
  SELECT
      votes.electionid,
      count(votes.id) as totalVote
  FROM votes
  GROUP BY electionid
) as totalVotes ON votes.electionid = totalVotes.electionid
GROUP BY electionid, candidateid

SELECT
FROM votes
LEFT JOIN electionOfficeCandidates ON votes.candidateid = electionOfficeCandidates.id
LEFT JOIN electionOfficeCandidates ON votes.candidateid = electionOfficeCandidates.id

SELECT
  SUBSTR(`registrantid`, 2);
FROM votes
