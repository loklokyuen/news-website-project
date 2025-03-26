const db = require("../db/connection");
const {
	checkArticleExists,
	checkUserExists,
	checkTopicExists,
} = require("../utils/checkExistenceInDB");

exports.selectArticleById = (article_id) => {
	return db
		.query(
			`SELECT a.author, title, a.article_id, a.body, topic, a.created_at, 
        a.votes, article_img_url, COUNT(c.comment_id) AS comment_count
        FROM articles AS a LEFT OUTER JOIN comments AS c USING (article_id)
        WHERE article_id = $1
        GROUP BY article_id`,
			[article_id]
		)
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ code: 404, msg: "Article not found" });
			}
			return rows[0];
		});
};

exports.selectArticles = (
	sort_by = "created_at",
	order = "desc",
	topic,
	page = 1,
	limit = 10
) => {
	if (isNaN(Number(page)) || isNaN(Number(limit))) {
		return Promise.reject({ code: 400, msg: "Bad request" });
	}
	let baseQuery = `
        SELECT a.author, title, article_id, topic, a.created_at, a.votes, article_img_url, COUNT(comment_id) AS comment_count
        FROM articles AS a LEFT OUTER JOIN comments AS c USING (article_id)`;
	let whereClause = "";
	if (topic) {
		whereClause = ` WHERE topic = '${topic}'`;
	}
	let totalCount;
	return (topic ? checkTopicExists(topic) : Promise.resolve())
		.then(() => {
			return db.query(`SELECT COUNT(*) FROM articles ${whereClause}`);
		})
		.then(({ rows }) => {
			totalCount = rows[0].count;
		})
		.then(() => {
			const sortByGreenlist = [
				"author",
				"title",
				"article_id",
				"created_at",
				"votes",
				"article_img_url",
				"comment_count",
			];
			const orderGreenlist = ["asc", "desc"];
			if (
				!sortByGreenlist.some(
					(item) => item.toLowerCase() === sort_by.toLowerCase()
				) ||
				!orderGreenlist.some(
					(item) => item.toLowerCase() === order.toLowerCase()
				)
			) {
				return Promise.reject({ code: 400, msg: "Bad request" });
			}
			const offset = limit * (page - 1);
			const fullQuery = `${baseQuery} ${whereClause} GROUP BY article_id ORDER BY ${sort_by} ${order}  LIMIT ${limit} OFFSET ${offset}`;
			return db.query(fullQuery);
		})
		.then(({ rows }) => {
			return { articles: rows, total_count: totalCount };
		});
};

exports.selectCommentsByArticleId = (article_id, page = 1, limit = 10) => {
	if (isNaN(Number(page)) || isNaN(Number(limit))) {
		return Promise.reject({ code: 400, msg: "Bad request" });
	}
	const offset = limit * (page - 1);
	return checkArticleExists(article_id)
		.then(() => {
			return db.query(
				`SELECT comment_id, c.votes, c.created_at, c.author, c.body, article_id, avatar_url, name
            FROM articles AS a INNER JOIN comments AS c USING (article_id)
            INNER JOIN users AS u ON c.author = u.username
            WHERE article_id = $1 ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
				[article_id, limit, offset]
			);
		})
		.then(({ rows }) => {
			return rows;
		});
};

exports.insertCommentToArticle = (article_id, username, body) => {
	return checkArticleExists(article_id)
		.then(() => {
			return checkUserExists(username);
		})
		.then(() => {
			return db.query(
				`INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`,
				[body, article_id, username]
			);
		})
		.then(({ rows }) => {
			return rows[0];
		});
};

exports.insertArticle = (author, title, body, topic, article_img_url) => {
	return checkUserExists(author)
		.then(() => {
			return checkTopicExists(topic);
		})
		.then(() => {
			const args = [title, topic, author, body];
			let insertStatement = "";
			if (article_img_url) {
				insertStatement = `(INSERT INTO articles (title, topic, author, body, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *)`;
				args.push(article_img_url);
			} else {
				insertStatement = `(INSERT INTO articles (title, topic, author, body) VALUES ($1, $2, $3, $4) RETURNING *)`;
			}
			const fullQuery = `WITH inserted AS ${insertStatement} 
            SELECT i.*, COUNT(comment_id) AS comment_count
            FROM inserted AS i LEFT OUTER JOIN comments USING (article_id)
            GROUP BY i.article_id, i.title, topic, i.author, i.body, i.created_at, i.votes, article_img_url`;
			return db.query(fullQuery, args).then(({ rows }) => {
				return rows[0];
			});
		});
};

exports.updateVotesOfArticle = (article_id, voteChange) => {
	return checkArticleExists(article_id)
		.then(() => {
			return db.query(
				`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
				[voteChange, article_id]
			);
		})
		.then(({ rows }) => {
			return rows[0];
		});
};

exports.removeArticleById = (article_id) => {
	return checkArticleExists(article_id).then(() => {
		return db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id]);
	});
};
