
/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: 'Express', year: new Date().getFullYear() });
};

exports.about = function (req, res) {
    res.render('about', { title: 'About', year: new Date().getFullYear(), message: 'Your application description page' });
};

exports.remote = function (req, res) {
    res.render('remote', { title: 'Remote control', year: new Date().getFullYear(), message: 'Your contact page' });
};
exports.referee = function (req, res) {
    res.render('referee', { title: 'Referee 1vs1', year: new Date().getFullYear(), message: 'Your contact page' });
};
exports.referee2 = function (req, res) {
    res.render('referee2', { title: 'Referee 2vs2', year: new Date().getFullYear(), message: 'Your contact page' });
};
exports.live = function (req, res) {
    res.render('live', { title: 'Live Feed', year: new Date().getFullYear(), message: 'Your contact page' });
};
