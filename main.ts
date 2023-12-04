
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

			if
				(
					req.body.id_Catergoria   === undefined || req.body.nome_estabelecimento === undefined ||
					req.body.local_bloco     === undefined || req.body.local_sala           === undefined
				)
			{
				this.r_set_cors(res);
				res.status(400);
				res.end();
				return;
			}

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

			const has_val = req.body.horario_aberto    ? `"${req.body.horario_aberto}"`    : "NULL";
			const hfs_val = req.body.horario_fechado   ? `"${req.body.horario_fechado}"`   : "NULL";
			const hps_val = req.body.horario_pico      ? `"${req.body.horario_pico}"`      : "NULL";

			const idu_val = req.body.id_Dono           ?  `${req.body.id_Dono}`            : "NULL";
			const nda_val = req.body.nome_dono_anonimo ? `"${req.body.nome_dono_anonimo}"` : "NULL";

			this.db.query(`
				INSERT INTO Servico(id_Catergoria, id_Dono, nome_dono_anonimo, nome_estabelecimento,
									horario_aberto, horario_fechado, horario_pico, local_bloco, local_sala, local_complemento)
				VALUES ("${req.body.id_Catergoria}",${idu_val},${nda_val},"${req.body.nome_estabelecimento}",
						 ${has_val},${hfs_val},${hps_val},
						"${req.body.local_bloco}","${req.body.local_sala}","${req.body.local_complemnto}")
				`,
			(_e: Error, _r: any, _i: any) => {
				console.log(_e);
				this.r_set_cors(res);
				res.status(201);
				res.end();
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

		private get_handlers: { [key: string]: any } =
		{
			"/users":         this.users_list_handler,
			"/users/:id":     this.users_id_read_handler,
			"/catergory":     this.catergory_list_handler,
			"/catergory/:id": this.catergory_id_read_handler,
			"/services":      this.services_list_handler,
			"/services/:id":  this.services_id_read_handler
		}

		private post_handlers: { [key: string]: any } =
		{
			"/users":         this.users_create_handler,
			"/catergory":     this.catergory_create_handler,
			"/services":      this.services_create_handler
		}

		private put_handlers: { [key: string]: any } =
		{
			"/users/:id":     this.users_id_update_handler,
			"/catergory/:id": this.catergory_id_update_handler,
			"/services/:id":  this.services_id_update_handler
		}

		private delete_handlers: { [key: string]: any } =
		{
			"/users/:id":     this.users_id_delete_handler,
			"/catergory/:id": this.catergory_id_delete_handler,
			"/services/:id":  this.services_id_delete_handler
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
