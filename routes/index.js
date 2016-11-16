
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
