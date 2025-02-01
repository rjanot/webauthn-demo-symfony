<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TopSecretAreaController extends AbstractController
{
    #[Route('/top-secret-area', name: 'app_top_secret_area', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('top-secret-area/index.html.twig', [
            'controller_name' => 'TopSecretAreaController',
        ]);
    }
}
