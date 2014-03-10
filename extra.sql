SELECT
        DATE_FORMAT(RegisterDate, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2013-05-06', DATE_FORMAT(RegisterDate, '%Y-%m-%d')) as daysOut,
        COUNT(firstname) as count,
        (select count(*) from GRCombinedRegistrations04
       where  DATE_FORMAT(RegisterDate, '%Y-%m-%d') <= dateRegistered) as total
FROM GRCombinedRegistrations04
GROUP BY dateRegistered ASC


SELECT
        DATE_FORMAT(register_date, '%Y-%m-%d') as dateRegistered,
        DATEDIFF('2014-05-05', DATE_FORMAT(register_date, '%Y-%m-%d')) as daysOut,
        SUM(memtot) as count,
        (select SUM(memtot) from conf_dtregister_user
       where  DATE_FORMAT(register_date, '%Y-%m-%d') <= dateRegistered AND (
              eventid = 9 OR eventid = 10)) as total
FROM conf_dtregister_user
WHERE eventid = 9 OR eventid = 1
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
