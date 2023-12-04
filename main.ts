
import ex from 'express';
import crypto from 'crypto';
import sql from 'mysql';

namespace vin
{
	export class Server
	{
		private app: ex.Express = ex();
        private db:  sql.Connection;

		private r_set_cors = (res: ex.Response): void =>
		{
			res.header("Access-Control-Allow-Origin",  "*");
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
			res.header("Access-Control-Allow-Headers", "*");
		}

		private hash_passwd = (passwd: string): string =>
		{
			return  crypto.createHash("sha256").update(passwd).digest('hex');
		}

		/* BEGIN /users[/:id] */

		private users_list_handler = (_req: ex.Request, res: ex.Response): void =>
		{

			this.db.query('SELECT * from Usuario', (_e: Error, r: any , _i: any) => {

				const data = r.map((x: any) => {
					return {ID: x.ID, nome: x.nome, is_admin: x.is_admin}
				});

				this.r_set_cors(res);
				res.send(data);
				res.end();
			});

		}

		private users_create_handler = (req: ex.Request, res: ex.Response): void =>
		{

			if (req.body.nome === undefined || req.body.email === undefined || req.body.senha === undefined || req.body.is_admin === undefined)
			{
				this.r_set_cors(res);
				res.status(400);
				res.end();
				return;
			}

			const nu =
			{
				nome:     req.body.nome,
				email:    req.body.email,
				senha:    this.hash_passwd(req.body.senha),
				is_admin: req.body.is_admin
			}

			this.db.query(`INSERT INTO Usuario(nome, email, senha, is_admin) VALUES ("${nu.nome}","${nu.email}","${nu.senha}","${nu.is_admin}")`, (_e: Error, _r: any, _i: any) => {
				this.r_set_cors(res);
				res.status(201);
				res.end();
			});

		}

		private users_id_read_handler = (req: ex.Request, res: ex.Response): void =>
		{

			this.db.query(`SELECT nome, email, senha, is_admin from Usuario where (ID = ${req.params.id})`, (_e: Error, r: any, _i: any) => {

				this.r_set_cors(res);

				if (r.length === 0) res.status(404).end();
				else                res.send(r).end();
			});

		}

		private users_id_update_handler = (req: ex.Request, res: ex.Response): void =>
		{

			let set_query = "";

			if (req.body.nome     !== undefined) set_query += `nome     = "${req.body.nome}",`;
			if (req.body.email    !== undefined) set_query += `email    = "${req.body.email}",`;
			if (req.body.senha    !== undefined) set_query += `senha    = "${this.hash_passwd(req.body.senha)}",`;
			if (req.body.is_admin !== undefined) set_query += `is_admin = ${req.body.is_admin}`;

			set_query = set_query.replace(/,+$/, "");

			if (set_query === "") { res.status(400).end(); return; }

			this.db.query(`UPDATE Usuario SET ${set_query} WHERE (ID = ${req.params.id})`, (e: Error, r: any, i: any) => {
				console.log(e, r, i);
				this.r_set_cors(res);
				res.end();
			});
		}

		private users_id_delete_handler = (req: ex.Request, res: ex.Response): void =>
		{

			this.db.query(`DELETE FROM Usuario WHERE (ID = ${req.params.id})`, (err: Error, r: any, _i: any) => {

				this.r_set_cors(res);

				if (err)                  res.status(409).end(); // Conflict : Remoção invalida a DB
				if (r.affectedRows === 0) res.status(404).end(); // Not Found

				res.end();

			});

		}

		/* END   /users[/:id] */
		/* BEGIN /catergory[/:id] */

		private catergory_list_handler = (_req: ex.Request, res: ex.Response): void =>
		{

			this.db.query('SELECT * from Catergoria', (_e: Error, r: any , _i: any) => {

				this.r_set_cors(res);
				res.send(r).end();

			});

		}

		private catergory_create_handler = (req: ex.Request, res: ex.Response): void =>
		{
			if (req.body.nome === undefined) this.r_set_cors, res.status(400).end(); else
			{
				this.db.query(`INSERT INTO Catergoria(nome) VALUES ("${req.body.nome}")`,  (_e: Error, _r: any, _i: any) => {
					this.r_set_cors(res), res.status(201).end();
				})
			}
		}

		private catergory_id_read_handler = (req: ex.Request, res: ex.Response): void =>
		{

			this.db.query(`SELECT nome from Catergoria WHERE (ID = ${req.params.id})`, (_e: Error, r: any, _i: any) => {
				this.r_set_cors(res);
				if (r.length === 0) res.status(404).end();
				else                res.send(r)    .end();
			});

		}

		private catergory_id_update_handler = (req: ex.Request, res: ex.Response): void =>
		{
			let set_query = "";

			this.r_set_cors(res);

			if (req.body.nome !== undefined) set_query += `nome = "${req.body.nome}",`;

			set_query = set_query.replace(/,+$/, "");

			if (set_query === "") { res.status(400).end(); return; }

			this.db.query(`UPDATE Catergoria SET ${set_query} WHERE (ID = ${req.params.id})`, (e: Error, r: any, i: any) => {
				console.log(e, r, i);
				res.end();
			});
		}

		private catergory_id_delete_handler = (req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`DELETE FROM Catergoria WHERE (ID = ${req.params.id})`, (err: Error, r: any, _i: any) => {

				this.r_set_cors(res);

				if (err)                  res.status(409).end(); // Conflict : Remoção invalida a DB
				if (r.affectedRows === 0) res.status(404).end(); // Not Found

				res.end();
			});
		}

		/* END   /catergory[/:id] */
		/* BEGIN /services[/:id]  */

		private services_list_handler = (_req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`
				SELECT s.ID, c.nome catergoria, s.nome_dono_anonimo nome_dono, s.nome_estabelecimento
				FROM Servico s
				JOIN Catergoria c
				WHERE (s.id_Catergoria = c.ID && s.nome_dono_anonimo IS NOT NULL)

				UNION

				SELECT s.ID, c.nome catergoria, u.nome nome_dono, s.nome_estabelecimento
				FROM Servico s
				JOIN Catergoria c JOIN Usuario u
				WHERE (s.id_Catergoria = c.ID && s.id_Dono = u.ID)
			`,
			(_e: Error, r: any , _i: any) => {
				this.r_set_cors(res);
				res.send(r).end();
			});
		}

		private services_create_handler = (req: ex.Request, res: ex.Response): void =>
		{

			if ( !(req.body.id_Dono || req.body.nome_dono_anonimo) )
			{
				this.r_set_cors(res);
				res.status(400);
				res.end();
				return;
			}

			if (req.body.id_Dono && req.body.nome_dono_anonimo)
			{
				this.r_set_cors(res);
				res.status(400);
				res.end();
				return;
			}

			let into_query: string = "";
			let vals_query: string = "";

			for (let key in req.body) into_query +=  `${key},`;
			for (let key in req.body) vals_query += `"${req.body[key]}",`;

			into_query = into_query.replace(/,+$/, "");
			vals_query = vals_query.replace(/,+$/, "");

			this.db.query(`INSERT INTO Servico(${into_query}) VALUES (${vals_query})`, (err: Error, r: any, _i: any) => {
				this.r_set_cors(res);
				if (err) res.status(400).send(err).end();
				else     res.status(201).end();
			});

		}

		private services_id_read_handler = (req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`SELECT * from Servico WHERE (ID = ${req.params.id})`, (_e: Error, r: any, _i: any) => {
				this.r_set_cors(res);
				if (r.length === 0) res.status(404).end();
				else                res.send(r)    .end();
			});
		}

		private services_id_update_handler = (req: ex.Request, res: ex.Response): void =>
		{

			let set_query = "";

			this.r_set_cors(res);

			for (let key in req.body)
			{
				if (key === "ID")
				{
					res.status(400).end(); return;
				}
				set_query += `${key} = "${req.body[key]}",`
			}

			set_query = set_query.replace(/,+$/, "");

			if (set_query === "") { res.status(400).end(); return; }

			this.db.query(`UPDATE Servico SET ${set_query} WHERE (ID = ${req.params.id})`, (err: Error, r: any, _i: any) => {
				     if (err)            res.status(400).send(err).end();
				else if (r.length === 0) res.status(404).end();
				else                     res.end();
			});
		}

		private services_id_delete_handler = (req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`DELETE FROM Servico WHERE (ID = ${req.params.id})`, (err: Error, r: any, _i) => {
				this.r_set_cors(res);

				if (err)                  res.status(409).end(); // Conflict : Remoção invalida a DB
				if (r.affectedRows === 0) res.status(404).end(); // Not Found

				res.end();
			});
		}

		/* END   /services[/:id]  */
		/* BEGIN /services/:id/items[/:cid]  */

		private services_id_items_list_handler = (req: ex.Request, res: ex.Response): void =>
		{
 			this.db.query(`SELECT ID, nome, tipo, preco FROM Item WHERE (id_Servico = ${req.params.id})`, (err: Error, r: any , _i: any) => {
				this.r_set_cors(res);
				console.log(err, r, _i);
				     if (err)            res.status(400).send(err).end();
				else if (r.length === 0) res.status(404).send().end();
				else                     res.send(r)    .end();
			});
		}

		private services_id_items_create_handler = (req: ex.Request, res: ex.Response): void =>
		{

			req.body.id_Servico = req.params.id;

			let into_query: string = "";
			let vals_query: string = "";

			for (let key in req.body) into_query +=  `${key},`;
			for (let key in req.body) vals_query += `"${req.body[key]}",`;

			into_query = into_query.replace(/,+$/, "");
			vals_query = vals_query.replace(/,+$/, "");

			this.db.query(`INSERT INTO Item(${into_query}) VALUES (${vals_query})`, (err: sql.MysqlError, _r: any, _i: any) => {
				this.r_set_cors(res);
				if (err)
				{
					if (err.code == "ER_NO_REFERENCED_ROW_2") res.status(409).send(`NO_SERVICE "${req.body.id_Servico}"`).end();
					else                                      res.status(400).send(err).end();
				}
				else     res.status(201).end();
			});

		}

		private services_id_items_cid_read_handler = (req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`SELECT nome, tipo, preco FROM Item WHERE (ID = ${req.params.cid} && id_Servico = ${req.params.id})`,
			(_e: Error, r: any, _i: any) => {
				this.r_set_cors(res);
				if (r.length === 0) res.status(404).end();
				else                res.send(r);
			})
		}

		private services_id_items_cid_update_handler = (req: ex.Request, res: ex.Response): void =>
		{
			let set_query = "";

			this.r_set_cors(res);

			for (let key in req.body)
			{
				if (key === "ID")
				{
					res.status(400).end(); return;
				}
				set_query += `${key} = "${req.body[key]}",`
			}

			set_query = set_query.replace(/,+$/, "");

			if (set_query === "") { res.status(400).end(); return; }


			this.db.query(`UPDATE Item SET ${set_query} WHERE (ID = ${req.params.cid} && id_Servico = ${req.params.id})`,
			(err: Error, r: any, _i: any) => {
				     if (err)                  res.status(400).send(err).end();
				else if (r.affectedRows === 0) res.status(404).end();
				else                           res.end();
			});
		}

		private services_id_items_cid_delete_handler = (req: ex.Request, res: ex.Response): void =>
		{
			this.db.query(`DELETE FROM Item WHERE (ID = ${req.params.cid} && id_Servico = ${req.params.id})`,
			(err: Error, r: any, _i) => {
				this.r_set_cors(res);

					 if (err)                  res.status(409).send(err).end(); // Conflict : Remoção invalida a DB
				else if (r.affectedRows === 0) res.status(404).end();           // Not Found

				res.end();
			});
		}

		/* END   /services/:id/items[/:cid]  */

		private get_handlers: { [key: string]: any } =
		{
			"/users":                   this.users_list_handler,
			"/users/:id":               this.users_id_read_handler,
			"/catergory":               this.catergory_list_handler,
			"/catergory/:id":           this.catergory_id_read_handler,
			"/services":                this.services_list_handler,
			"/services/:id":            this.services_id_read_handler,
			"/services/:id/items":      this.services_id_items_list_handler,
			"/services/:id/items/:cid": this.services_id_items_cid_read_handler
		}

		private post_handlers: { [key: string]: any } =
		{
			"/users":                   this.users_create_handler,
			"/catergory":               this.catergory_create_handler,
			"/services":                this.services_create_handler,
			"/services/:id/items":      this.services_id_items_create_handler
		}

		private put_handlers: { [key: string]: any } =
		{
			"/users/:id":               this.users_id_update_handler,
			"/catergory/:id":           this.catergory_id_update_handler,
			"/services/:id":            this.services_id_update_handler,
			"/services/:id/items/:cid": this.services_id_items_cid_update_handler
		}

		private delete_handlers: { [key: string]: any } =
		{
			"/users/:id":               this.users_id_delete_handler,
			"/catergory/:id":           this.catergory_id_delete_handler,
			"/services/:id":            this.services_id_delete_handler,
			"/services/:id/items/:cid": this.services_id_items_cid_delete_handler
		}

		constructor(port: number)
		{

			this.db = sql.createConnection({ host: 'localhost', user: 'tubaina', password: 'tubainazn!', database: 'serviços' });

			this.app.use(ex.json());

			for (let handler in this.get_handlers)
				this.app.get(handler, this.get_handlers[handler]);

			for (let handler in this.post_handlers)
				this.app.post(handler, this.post_handlers[handler]);

			for (let handler in this.put_handlers)
				this.app.put(handler, this.put_handlers[handler]);

			for (let handler in this.delete_handlers)
				this.app.delete(handler, this.delete_handlers[handler]);

			/* CORS bugfix */
			this.app.use((req, res, next) => {

				if (req.method === "OPTIONS") {
					this.r_set_cors(res);
					return res.status(200).end();
				}

				return next();
			});

			this.app.listen(port);

			console.log("server up on", port);
		}
	}
}

function main(): void
{

	const server = new vin.Server(8080);

}

main();
