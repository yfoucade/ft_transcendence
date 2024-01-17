NAME = ft_transcendance

all:
	@printf "Execution de la configuration ${NAME}...\n"
	@docker compose up --build

clean:
	@printf "Arret de la configuration ${NAME}...\n"
	@docker compose down

fclean: clean
	@printf "Arrêt des configurations en cours\n"
	# @docker volume rm ft_transcendance_db-data
	# @docker volume rm ft_transcendance_src-data
	@docker system prune --all --force
	@docker system prune --volumes


status:
	docker compose ps
	docker compose ls
	docker container ls
	docker image ls
	docker volume ls

re: clean all

reset: fclean all

.PHONY: all clean fclean re reset status