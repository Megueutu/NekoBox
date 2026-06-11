// eu vou separar o back do front, para o back trabalhar de forma independente e vice-versa
// pra isso, o spring vai rodar em uma porta diferente do REACT
// esse arquivo é quem configura as portas que o spring aceita requisição, se quiser saber mais, pesquisa CORS spring


@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // define um padrão de URL aceita, acho desnessario já que não serão varias APIs
            .allowedOrigins("http://localhost:5173") // porta do REACT que pode fazer requisição pro spring, se mudar avisar
            .allowedMethods("*") // métodos que o spring aceita
            .allowedHeaders("*"); // config de cabeçalho de requisição(ngm liga :] )
    }
}