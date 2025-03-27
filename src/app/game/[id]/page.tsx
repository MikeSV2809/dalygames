import { GameProps } from "@/utils/types/game";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/container";
import { Label } from "./components/label";
import { GameCard } from "@/components/GameCard";
import { Metadata } from "next";



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    try {
        const res = await fetch(`${process.env.NEXT_API_URL}/next-api/?api=game&id=${id}`, { 
            next: { revalidate: 60 } 
        });

        if (!res.ok) {
            throw new Error("Falha ao buscar os dados do jogo");
        }

        const response: GameProps = await res.json();

        return {
            title: response.title,
            description: `${response.description.slice(0, 100)}...`,
            openGraph: {
                title: response.title,
                images: [response.image_url]
            }
        };
    } catch (err) {
        return {
            title: "DalyGames - Descubra jogos incríveis para se divertir."
        };
    }
}

async function getData(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_API_URL}/next-api/?api=game&id=${id}`, { next: { revalidate: 60 } })
        return res.json();
    } catch (err) {
        throw new Error("Failed to fetch data")
    }
}

async function getGameSorted() {
    try {
        const res = await fetch(`${process.env.NEXT_API_URL}/next-api/?api=game_day`, { cache: "no-store" })
        return res.json();
    } catch (err) {
        throw new Error("Failed to fetch data")
    }
}

export default async function Game({ params }: {
    params: Promise<{ id: string }>
}) {

    const id = (await params).id;
    const data: GameProps = await getData(id)
    const sortedGame: GameProps = await getGameSorted();

    if (!data) {
        redirect("/")
    }

    console.log(data);
    return (
        <main className="w-full text-black">
            <div className="bg-black h-80 sm:h-96 w-full relative">
                <Image
                    className="object-cover w-full h-80 sm:h-96 opacity-75"
                    src={data.image_url}
                    alt={data.title}
                    priority={true}
                    fill={true}
                    quality={100}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 44vw"
                />
            </div>
            <Container>
                <h1 className="font-bold text-xl my-4">{data.title}</h1>
                <p>{data.description}</p>

                <h2 className="font-bold text-lg mt-7 mb-2">Plataformas</h2>
                <div className="flex gap-2 flex-wrap">
                    {data.platforms.map((item) => (
                        <Label name={item} key={item} />
                    ))}
                </div>

                <h2 className="font-bold text-lg mt-7 mb-2">Categorias</h2>
                <div className="flex gap-2 flex-wrap">
                    {data.categories.map((item) => (
                        <Label name={item} key={item} />
                    ))}
                </div>

                <p className="mt-7 mb-2">Data de lançamento:<strong>{data.release}</strong></p>

                <h2 className="font-bold text-lg mt-7 mb-2">Jogo recomendado:</h2>
                <div className="flex">
                    <div className="flex-grow">
                        <GameCard data={sortedGame} />
                    </div>
                </div>
            </Container>
        </main>
    )
}